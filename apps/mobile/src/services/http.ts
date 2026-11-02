import { z } from 'zod';

export const API_REQUEST_TIMEOUT_MS = 90000;
const NETWORK_ERROR = 'Não consegui conectar à Vera. Confira a conexão e tente novamente.';

// React Native's XMLHttpRequest avoids Expo Go's native fetch cancellation path.
// It is used for every request, with no automatic retries or fallback paid calls.
function requestJson<T>(method: 'GET' | 'POST', url: string, body: unknown, schema: z.ZodType<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    let settled = false;
    function complete(action: () => void) {
      if (settled) return;
      settled = true;
      request.onload = request.onerror = request.ontimeout = request.onabort = null;
      action();
    }
    const fail = (message: string) => complete(() => reject(new Error(message)));

    request.onload = () => {
      let value: unknown;
      try { value = JSON.parse(request.responseText); }
      catch { fail('Recebi uma resposta inesperada. Tente novamente em instantes.'); return; }
      if (request.status < 200 || request.status >= 300) {
        const serverError = z.object({ error: z.object({ message: z.string().max(1000) }) }).safeParse(value);
        fail(serverError.success ? serverError.data.error.message : 'O servidor está indisponível. Tente novamente em instantes.');
        return;
      }
      const parsed = schema.safeParse(value);
      if (!parsed.success) { fail('Recebi uma resposta inesperada. Tente novamente em instantes.'); return; }
      complete(() => resolve(parsed.data));
    };
    request.onerror = () => fail(NETWORK_ERROR);
    request.ontimeout = () => fail('O envio ou a análise demorou mais que o esperado. Confira sua conexão e tente novamente.');
    request.onabort = () => fail('O envio foi interrompido. Tente novamente.');
    try {
      request.open(method, url, true);
      request.timeout = timeoutMs;
      request.withCredentials = false;
      request.setRequestHeader('Content-Type', 'application/json');
      request.setRequestHeader('Accept', 'application/json');
      request.send(method === 'GET' ? null : JSON.stringify(body));
    } catch { fail(NETWORK_ERROR); }
  });
}
export function postJson<T>(url: string, body: unknown, schema: z.ZodType<T>, timeoutMs = API_REQUEST_TIMEOUT_MS): Promise<T> {
  return requestJson('POST', url, body, schema, timeoutMs);
}
export function getJson<T>(url: string, schema: z.ZodType<T>, timeoutMs = 20000): Promise<T> {
  return requestJson('GET', url, undefined, schema, timeoutMs);
}
