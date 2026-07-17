const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Captures the raw incoming chat text perfectly without stream drops
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

app.all('*', async (req, res) => {
  const targetUrl = `https://agentrouter.org${req.originalUrl}`;
  
  try {
    const headers = {
      'User-Agent': 'ClaudeCode/1.0.0',
      'X-Stainless-Runtime': 'node',
      'HTTP-Referer': 'https://github.com',
      'X-Title': 'ClaudeCode',
      'Content-Type': 'application/json'
    };

    // Forwards your AgentRouter API key automatically from Janitor AI
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      duplex: 'half'
    });

    res.status(response.status);

    // Filter out encoding headers that warp text streams
    for (const [key, value] of response.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // Streams the text chunks live into your chat box
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();

  } catch (err) {
    console.error('Proxy Error:', err);
    res.status(500).send({ error: 'Proxy failed', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bypass proxy running on port ${PORT}`);
});
