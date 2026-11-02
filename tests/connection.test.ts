import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { createRequire } from 'node:module';
import { resolveApiUrl } from '../apps/mobile/src/services/config';
import { buildApp } from '../apps/api/src/app';
const require = createRequire(import.meta.url);
const { createApiProxyMiddleware } = require('../apps/mobile/dev/api-proxy.cjs');
const servers: Server[] = [];
const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
afterEach(async () => { await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => s.close(() => resolve())))); await Promise.all(apps.splice(0).map(a => a.close())); });

describe('endereço da API no celular', () => {
  it('usa HTTPS pelo túnel Expo no iPhone', () => { expect(resolveApiUrl({ development: true, hostUri: 'vera.on.expo.app' })).toBe('https://vera.on.expo.app/vera-api'); });
  it('usa o Metro pela rede local, preservando a porta', () => { expect(resolveApiUrl({ development: true, hostUri: '192.168.1.13:8082' })).toBe('http://192.168.1.13:8082/vera-api'); });
  it('permite URL própria no build de distribuição', () => { expect(resolveApiUrl({ development: false, configuredUrl: 'https://api.example.com/' })).toBe('https://api.example.com'); });
  it('não usa endereço de desenvolvimento em produção', () => { expect(() => resolveApiUrl({ development: false, hostUri: '192.168.1.13:8082' })).toThrow('não foi configurado'); });
  it('não aceita credencial ou protocolo inválido no endereço público', () => {
    expect(() => resolveApiUrl({ development: false, configuredUrl: 'https://user:secret@example.com' })).toThrow();
    expect(() => resolveApiUrl({ development: false, configuredUrl: 'file:///secret' })).toThrow();
  });
});
describe('conexão entre Expo e backend', () => {
  async function proxy() {
    const api = await buildApp(); apps.push(api);
    await api.listen({ host: '127.0.0.1', port: 0 });
    const address = api.server.address(); if (!address || typeof address === 'string') throw new Error('Porta inválida.');
    const server = createServer(createApiProxyMiddleware((_req: unknown, res: import('node:http').ServerResponse) => { res.end('metro'); }, { port: address.port })); servers.push(server);
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const local = server.address(); if (!local || typeof local === 'string') throw new Error('Porta inválida.');
    return `http://127.0.0.1:${local.port}`;
  }
  it('encaminha health e preserva as rotas do Expo', async () => {
    const url = await proxy(); const health = await fetch(`${url}/vera-api/health`);
    expect(health.status).toBe(200); expect((await health.json()).aiConfigured).toBe(false);
    expect(await (await fetch(`${url}/status`)).text()).toBe('metro');
  });
  it('encaminha o corpo da análise e a falha real de chave ausente', async () => {
    const { sampleLabels } = await import('./fixtures/labels'); const url = await proxy();
    const response = await fetch(`${url}/vera-api/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: sampleLabels[0] }) });
    expect(response.status).toBe(503); expect((await response.json()).error.code).toBe('AI_NOT_CONFIGURED');
  });
  it('não encaminha outros caminhos para a API', async () => { const response = await fetch(`${await proxy()}/vera-api/.env`); expect(response.status).toBe(404); });
});
