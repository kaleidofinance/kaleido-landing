const next = require('next');
const { createServer } = require('http');
const { parse } = require('url');
const os = require('os');
const zlib = require('zlib');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT, 10) || 3020;

// Memory optimization
const maxMemory = Math.floor(os.totalmem() / (1024 * 1024 * 4)); // 1/4 of total memory
if (!dev) {
  process.env.NODE_OPTIONS = `--max-old-space-size=${maxMemory} --max-semi-space-size=${Math.floor(maxMemory/16)}`;
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Signal ready to PM2
function signalReady() {
  if (process.send) {
    process.send('ready');
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // Set common headers first
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Health check endpoint
      if (req.url === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        return res.end(JSON.stringify({
          status: 'healthy',
          pid: process.pid,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }));
      }

      // Handle API routes
      if (req.url.startsWith('/api')) {
        // Add CORS headers for API routes
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle OPTIONS request
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        // Add cache headers for specific endpoints
        if (req.url.includes('/api/testnet/check-registration')) {
          res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        }
      }

      // Enable compression if supported
      const acceptEncoding = req.headers['accept-encoding'] || '';
      if (acceptEncoding.includes('gzip')) {
        res.setHeader('Content-Encoding', 'gzip');
      }

      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    }
  });

  server.keepAliveTimeout = 60000;
  server.headersTimeout = 65000;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    signalReady();
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
