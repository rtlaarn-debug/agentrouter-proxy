const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so Janitor AI can connect without browser security errors
app.use(cors());

// Route the traffic and spoof the headers
app.use('/', createProxyMiddleware({
  target: 'https://agentrouter.org',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('User-Agent', 'ClaudeCode/1.0.0');
    proxyReq.setHeader('X-Stainless-Runtime', 'node');
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
