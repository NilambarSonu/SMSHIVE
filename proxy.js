const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const apiProxy = httpProxy.createProxyServer({});
const dashboardProxy = httpProxy.createProxyServer({});

// Create the main server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url.startsWith('/api')) {
    // Proxy API requests to NestJS backend
    apiProxy.web(req, res, { target: 'http://localhost:8000' });
  } else {
    // Proxy all other requests to Next.js dashboard
    dashboardProxy.web(req, res, { target: 'http://localhost:3001' });
  }
});

// Handle errors
apiProxy.on('error', (err, req, res) => {
  console.error('API Proxy Error:', err);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API service unavailable' }));
});

dashboardProxy.on('error', (err, req, res) => {
  console.error('Dashboard Proxy Error:', err);
  res.writeHead(500, { 'Content-Type': 'text/html' });
  res.end('Dashboard service unavailable');
});

// Handle upgrades for WebSocket
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/api')) {
    apiProxy.ws(req, socket, head, { target: 'http://localhost:8000' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔀 Proxy server running on port ${PORT}`);
  console.log(`   -> /api/* proxies to http://localhost:8000`);
  console.log(`   -> /* proxies to http://localhost:3001`);
});
