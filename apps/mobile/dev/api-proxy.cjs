const http = require('node:http');
const allowedPaths = new Set(['/health', '/api/nova-groups', '/api/extract', '/api/analyze', '/api/classify']);

// Development only: use the same public Expo tunnel for the mobile app and local API.
function createApiProxyMiddleware(next, { port = 3333 } = {}) {
  return (request, response, fallback) => {
    const path = (request.url || '').split('?')[0];
    if (path !== '/vera-api' && !path.startsWith('/vera-api/')) return next(request, response, fallback);
    const targetPath = path.slice('/vera-api'.length);
    const sendError = (status, code, message) => {
      if (response.destroyed || response.writableEnded) return;
      if (response.headersSent) { response.destroy(); return; }
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ error: { code, message } }));
    };
    if (!allowedPaths.has(targetPath) && !/^\/api\/jobs\/[0-9a-f-]{36}$/.test(targetPath)) { sendError(404, 'NOT_FOUND', 'Esse endereço não está disponível.'); return; }
    const headers = {};
    for (const name of ['content-type', 'content-length']) if (request.headers[name]) headers[name] = request.headers[name];
    const upstream = http.request({ hostname: '127.0.0.1', port, path: targetPath, method: request.method, headers }, result => {
      response.writeHead(result.statusCode || 502, { 'Content-Type': result.headers['content-type'] || 'application/json', 'Cache-Control': 'no-store' });
      result.on('error', () => response.destroy()); result.pipe(response);
    });
    upstream.setTimeout(60000, () => upstream.destroy(new Error('timeout')));
    upstream.on('error', () => sendError(503, 'SERVER_UNAVAILABLE', 'Não consegui conectar ao servidor da Vera. Tente novamente em instantes.'));
    request.on('aborted', () => upstream.destroy());
    request.on('error', () => upstream.destroy());
    response.on('close', () => { if (!response.writableEnded) upstream.destroy(); });
    request.pipe(upstream);
  };
}
module.exports = { createApiProxyMiddleware };
