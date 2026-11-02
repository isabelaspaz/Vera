import { z } from 'zod';
import { buildApp } from './app';
const env = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3333), HOST: z.string().default('0.0.0.0'),
  GEMINI_API_KEY: z.string().optional(), GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
}).parse(process.env);
const app = await buildApp({ apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL,
  onNetworkEvent: process.env.VERA_NETWORK_DIAGNOSTICS === '1' ? event => console.info('[VERA rede]', JSON.stringify(event)) : undefined,
});
await app.listen({ host: env.HOST, port: env.PORT });
console.info(`VERA API pronta na porta ${env.PORT}. IA configurada: ${!!env.GEMINI_API_KEY}.`);
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => { void app.close(); });
