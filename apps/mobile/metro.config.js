const { getDefaultConfig } = require('expo/metro-config');
const { createApiProxyMiddleware } = require('./dev/api-proxy.cjs');
const config = getDefaultConfig(__dirname);
const originalEnhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => createApiProxyMiddleware(
  originalEnhance ? originalEnhance(middleware, server) : middleware,
  { port: Number(process.env.VERA_API_PORT || 3333) },
);
module.exports = config;
