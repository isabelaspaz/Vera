import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import {
  analyzeRequestSchema, extractRequestSchema, labelSchema, novaSchema,
  analyzeLabel, guideCatalog, novaNames,
} from '@vera/shared';
import { createGemini, ProviderError, type AiProvider } from './services/gemini/provider';
import { validateNova } from './services/nova/validate';
import { validateImages } from './middleware/images';
import { AnalysisJobs } from './services/analysis/jobs';
type Options = { provider?: AiProvider; apiKey?: string; model?: string; rateMax?: number; onNetworkEvent?: (event: { phase: string; route: string; status?: number; durationMs?: number }) => void };
export async function buildApp(options: Options = {}) {
  const app = Fastify({ logger: false, bodyLimit: 6 * 1024 * 1024, requestTimeout: 90000, connectionTimeout: 95000 });
  await app.register(rateLimit, { max: options.rateMax ?? 20, timeWindow: '1 minute' });
  if (options.onNetworkEvent) {
    const tracked = new Set(['/api/extract', '/api/analyze', '/api/classify']);
    const started = new WeakMap<object, number>();
    app.addHook('onRequest', async request => {
      if (tracked.has(request.url)) { started.set(request, Date.now()); options.onNetworkEvent?.({ phase: 'received', route: request.url }); }
    });
    app.addHook('onResponse', async (request, reply) => {
      const start = started.get(request);
      if (start !== undefined) options.onNetworkEvent?.({ phase: 'completed', route: request.url, status: reply.statusCode, durationMs: Date.now() - start });
    });
    app.addHook('onRequestAbort', async request => {
      const start = started.get(request);
      if (start !== undefined) options.onNetworkEvent?.({ phase: 'aborted', route: request.url, durationMs: Date.now() - start });
    });
  }
  const provider = options.provider ?? (options.apiKey ? createGemini(options.apiKey, options.model ?? 'gemini-3.5-flash-lite') : null);
  const requireProvider = () => { if (!provider) throw new ProviderError('AI_NOT_CONFIGURED', 503); return provider; };
  let inFlight = 0;
  const reserve = () => {
    if (inFlight >= 4) throw new ProviderError('BUSY', 503);
    inFlight++;
    return () => { inFlight--; };
  };
  const bounded = async <T>(fn: () => Promise<T>): Promise<T> => {
    const release = reserve();
    try { return await fn(); } finally { release(); }
  };
  const describeError = (error: unknown) => {
    const httpStatus = error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
    const status = error instanceof ZodError ? 400 : error instanceof ProviderError ? error.status : httpStatus;
    const code = error instanceof ZodError ? 'INVALID_INPUT' : error instanceof ProviderError ? error.code : status === 429 ? 'RATE_LIMIT' : status === 413 ? 'IMAGE_TOO_LARGE' : status === 400 ? 'INVALID_INPUT' : 'INTERNAL_ERROR';
    const messages: Record<string, string> = {
      INVALID_INPUT: 'Confira os campos enviados.', INVALID_IMAGE: 'Envie uma imagem JPEG ou PNG válida.', IMAGE_TOO_LARGE: 'Escolha uma foto de até 4 MB.',
      AI_UNAVAILABLE: 'Não consegui consultar a IA agora. Tente novamente.', AI_NOT_CONFIGURED: 'A IA ainda não foi configurada no servidor.',
      AI_AUTH_FAILED: 'Não consegui autenticar a IA. Confira a chave e as permissões no servidor.',
      AI_QUOTA_EXCEEDED: 'O limite de uso da IA foi atingido. Confira a cota do projeto Gemini ou tente novamente mais tarde.',
      AI_MODEL_UNAVAILABLE: 'O modelo de IA configurado não está disponível. Confira a configuração do servidor.',
      AI_INVALID_RESPONSE: 'Não consegui interpretar a resposta da IA. Tente outra foto.', AI_TIMEOUT: 'A IA demorou mais que o esperado. Tente novamente.',
      RATE_LIMIT: 'Aguarde um minuto antes de tentar novamente.', BUSY: 'A Vera está ocupada. Tente novamente em instantes.', INTERNAL_ERROR: 'Não consegui concluir agora. Tente novamente.',
      JOB_NOT_FOUND: 'Essa análise expirou ou o servidor foi reiniciado. Tente analisar a foto novamente.',
    };
    return { status, code, message: messages[code] ?? messages.INTERNAL_ERROR! };
  };
  app.setErrorHandler((error, _request, reply) => {
    const { status, code, message } = describeError(error);
    reply.status(status).send({ error: { code, message } });
  });
  const jobs = new AnalysisJobs({ reserve, describeError,
    onPhase: phase => options.onNetworkEvent?.({ phase, route: '/api/classify' }),
  });
  app.addHook('onClose', async () => jobs.close());
  app.post('/api/classify', async (request, reply) => {
    const { images } = extractRequestSchema.parse(request.body); validateImages(images);
    reply.header('Cache-Control', 'no-store').status(202);
    return jobs.create(requireProvider(), images);
  });
  app.get('/api/jobs/:id', { config: { rateLimit: { max: 120, timeWindow: '1 minute', groupId: 'analysis-status' } } }, async (request, reply) => {
    const { id } = z.object({ id: z.uuid() }).parse(request.params);
    reply.header('Cache-Control', 'no-store');
    return jobs.get(id);
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
