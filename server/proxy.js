// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — Production Reverse Proxy
// Routes traffic between Next.js dashboard and NestJS API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const http = require('http');
const httpProxy = require('http-proxy');

const PORT = parseInt(process.env.PORT, 10) || 10000;
const API_PORT = parseInt(process.env.API_PORT, 10) || 8000;
const DASHBOARD_PORT = parseInt(process.env.DASHBOARD_PORT, 10) || 3001;

const API_TARGET = `http://127.0.0.1:${API_PORT}`;
const DASHBOARD_TARGET = `http://127.0.0.1:${DASHBOARD_PORT}`;

// Create proxy instances
const apiProxy = httpProxy.createProxyServer({ target: API_TARGET, ws: true });
const dashboardProxy = httpProxy.createProxyServer({ target: DASHBOARD_TARGET, ws: true });

// Handle proxy errors gracefully (don't crash if backend isn't ready yet)
apiProxy.on('error', (err, req, res) => {
  console.error(`[proxy] API proxy error: ${err.message}`);
  if (res && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API service unavailable', code: 'PROXY_ERROR' }));
  }
});

dashboardProxy.on('error', (err, req, res) => {
  console.error(`[proxy] Dashboard proxy error: ${err.message}`);
  if (res && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Dashboard service unavailable');
  }
});

// Create the main HTTP server
const server = http.createServer((req, res) => {
  const url = req.url || '/';

  // Health check endpoint for Render / load balancers
  if (url === '/health' || url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Route /api/* and /socket.io/* to NestJS API
  if (url.startsWith('/api') || url.startsWith('/socket.io')) {
    apiProxy.web(req, res);
    return;
  }

  // Everything else goes to Next.js dashboard
  dashboardProxy.web(req, res);
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  const url = req.url || '/';

  if (url.startsWith('/socket.io')) {
    apiProxy.ws(req, socket, head);
  } else {
    dashboardProxy.ws(req, socket, head);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 SMSHIVE Reverse Proxy listening on port ${PORT}`);
  console.log(`   ├─ /api/*        → ${API_TARGET}`);
  console.log(`   ├─ /socket.io/*  → ${API_TARGET}`);
  console.log(`   └─ /*            → ${DASHBOARD_TARGET}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[proxy] SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[proxy] SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
