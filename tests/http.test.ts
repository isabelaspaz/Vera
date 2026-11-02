import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { API_REQUEST_TIMEOUT_MS, postJson } from '../apps/mobile/src/services/http';
const schema = z.object({ ok: z.boolean() });
class NativeRequest {
  static instances: NativeRequest[] = [];
  status = 0; responseText = ''; timeout = 0; withCredentials = true;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;
  open = vi.fn(); setRequestHeader = vi.fn(); send = vi.fn();
  constructor() { NativeRequest.instances.push(this); }
  respond(status: number, body: unknown) { this.status = status; this.responseText = JSON.stringify(body); this.onload?.(); }
}
const lastRequest = () => NativeRequest.instances.at(-1)!;
beforeEach(() => { NativeRequest.instances = []; vi.stubGlobal('XMLHttpRequest', NativeRequest); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('transporte nativo de análise no iPhone', () => {
  it('envia pelo XMLHttpRequest sem entrar no fetch do Expo', async () => {
    const expoFetch = vi.fn().mockRejectedValue(new Error('fetch failed: Fetch request has been canceled'));
    vi.stubGlobal('fetch', expoFetch);
    const result = postJson('https://example.com/api/extract', { photo: 'test-only' }, schema);
    const request = lastRequest();
    expect(request.open).toHaveBeenCalledWith('POST', 'https://example.com/api/extract', true);
    expect(request.send).toHaveBeenCalledWith(JSON.stringify({ photo: 'test-only' }));
    expect(request.timeout).toBe(API_REQUEST_TIMEOUT_MS); expect(request.withCredentials).toBe(false);
    request.respond(200, { ok: true }); expect(await result).toEqual({ ok: true });
    expect(expoFetch).not.toHaveBeenCalled();
  });
  it('não cancela pela passagem do antigo limite de 35 segundos', async () => {
    vi.useFakeTimers();
    const result = postJson('https://example.com/api/extract', {}, schema);
    const request = lastRequest();
    await vi.advanceTimersByTimeAsync(45000);
    expect(request.timeout).toBeGreaterThan(45000);
    request.respond(200, { ok: true }); expect(await result).toEqual({ ok: true });
  });
  it('traduz timeout nativo em mensagem simples', async () => {
    const result = postJson('https://example.com/api/extract', {}, schema);
    const rejected = expect(result).rejects.toThrow('demorou mais que o esperado');
    lastRequest().ontimeout?.(); await rejected;
  });
  it('traduz erro de rede sem expor detalhes nativos', async () => {
    const result = postJson('https://example.com/api/extract', {}, schema);
    const rejected = expect(result).rejects.toThrow('Não consegui conectar');
    lastRequest().onerror?.(); await rejected;
  });
  it('trata cancelamento e encerra os handlers da requisição', async () => {
    const result = postJson('https://example.com/api/extract', {}, schema);
    const rejected = expect(result).rejects.toThrow('envio foi interrompido');
    const request = lastRequest(); request.onabort?.(); await rejected;
    expect(request.onload).toBeNull(); expect(request.onerror).toBeNull();
  });
  it('preserva a mensagem da API sem repetir a consulta paga', async () => {
    const result = postJson('https://example.com/api/extract', {}, schema);
    const rejected = expect(result).rejects.toThrow('limite de uso');
    lastRequest().respond(429, { error: { message: 'O limite de uso da IA foi atingido.' } }); await rejected;
    expect(NativeRequest.instances).toHaveLength(1); expect(lastRequest().send).toHaveBeenCalledTimes(1);
  });
  it('trata HTML do gateway sem exibir erro de JSON', async () => {
    const result = postJson('https://example.com/api/extract', {}, schema);
    const rejected = expect(result).rejects.toThrow('resposta inesperada');
    const request = lastRequest(); request.status = 502; request.responseText = '<html>Bad Gateway</html>'; request.onload?.(); await rejected;
  });
});
