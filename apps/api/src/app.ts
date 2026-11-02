import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import {
  analyzeRequestSchema, extractRequestSchema, labelSchema, novaSchema,
  analyzeLabel, guideCatalog, novaNames,
} from '@vera/shared';
import { createGemini, ProviderError, type AiProvider } from './services/gemini/provider';
import { validateNova } from './services/nova/validate';
import { validateImages } from './middleware/images';
type Options = { provider?: AiProvider; apiKey?: string; model?: string; rateMax?: number };
export async function buildApp(options: Options = {}) {
  const app = Fastify({ logger: false, bodyLimit: 6 * 1024 * 1024, requestTimeout: 35000, connectionTimeout: 40000 });
  await app.register(rateLimit, { max: options.rateMax ?? 20, timeWindow: '1 minute' });
  const provider = options.provider ?? (options.apiKey ? createGemini(options.apiKey, options.model ?? 'gemini-3.5-flash-lite') : null);
  const requireProvider = () => { if (!provider) throw new ProviderError('AI_NOT_CONFIGURED', 503); return provider; };
  let inFlight = 0;
  const bounded = async <T>(fn: () => Promise<T>): Promise<T> => {
    if (inFlight >= 4) throw new ProviderError('BUSY', 503);
    inFlight++;
    try { return await fn(); } finally { inFlight--; }
  };
  app.setErrorHandler((error, _request, reply) => {
    const httpStatus = error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
    const status = error instanceof ZodError ? 400 : error instanceof ProviderError ? error.status : httpStatus;
    const code = error instanceof ZodError ? 'INVALID_INPUT' : error instanceof ProviderError ? error.code : status === 429 ? 'RATE_LIMIT' : status === 413 ? 'IMAGE_TOO_LARGE' : status === 400 ? 'INVALID_INPUT' : 'INTERNAL_ERROR';
    const messages: Record<string, string> = {
      INVALID_INPUT: 'Confira os campos enviados.', INVALID_IMAGE: 'Envie uma imagem JPEG ou PNG válida.', IMAGE_TOO_LARGE: 'Escolha uma foto de até 4 MB.',
      AI_UNAVAILABLE: 'Não consegui consultar a IA agora. Tente novamente.', AI_NOT_CONFIGURED: 'A IA ainda não foi configurada no servidor.',
      RATE_LIMIT: 'Aguarde um minuto antes de tentar novamente.', BUSY: 'A Vera está ocupada. Tente novamente em instantes.', INTERNAL_ERROR: 'Não consegui concluir agora. Tente novamente.',
    };
    reply.status(status).send({ error: { code, message: messages[code] ?? messages.INTERNAL_ERROR } });
  });
  app.get('/health', async () => ({ status: 'ok', aiConfigured: !!provider, mode: 'real' }));
  app.get('/api/nova-groups', async () => Object.entries(novaNames).map(([group, name]) => ({ group, name, recommendation: guideCatalog[group as keyof typeof guideCatalog] })));
  app.post('/api/extract', async request => {
    const { images } = extractRequestSchema.parse(request.body); validateImages(images);
    return bounded(async () => labelSchema.parse(await requireProvider().extract(images)));
  });
  app.post('/api/analyze', async request => {
    const { label } = analyzeRequestSchema.parse(request.body);
    return bounded(async () => {
      const candidate = novaSchema.parse(await requireProvider().classify(label));
      return analyzeLabel(label, randomUUID(), validateNova(label, candidate));
    });
  });
  return app;
}
