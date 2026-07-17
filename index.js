const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so Janitor AI can connect
app.use(cors());

// Route the traffic and clean the headers
app.use('/', createProxyMiddleware({
  target: 'https://agentrouter.org',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // 1. Inject the authorized developer headers
    proxyReq.setHeader('User-Agent', 'ClaudeCode/1.0.0');
    proxyReq.setHeader('X-Stainless-Runtime', 'node');
    proxyReq.setHeader('HTTP-Referer', 'https://github.com');
    proxyReq.setHeader('X-Title', 'Local-Proxy');
    
    // 2. Strip the browser headers that expose Janitor AI
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
    proxyReq.removeHeader('sec-fetch-dest');
    proxyReq.removeHeader('sec-fetch-mode');
    proxyReq.removeHeader('sec-fetch-site');
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
