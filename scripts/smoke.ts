import { buildApp } from '../apps/api/src/app';
const app = await buildApp();
try {
  const address = await app.listen({ host: '127.0.0.1', port: 0 });
  const response = await fetch(`${address}/health`);
  const body: unknown = await response.json();
  if (response.status !== 200) throw new Error('Health check falhou.');
  console.info(JSON.stringify({ httpStatus: response.status, body }));
} finally { await app.close(); }
