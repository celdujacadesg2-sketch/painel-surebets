const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';

const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3002', 10);

if (process.env.NODE_ENV === 'production') {
  if (!process.env.PORT) {
    console.error('❌ [FATAL] PORT não definida em produção. Configure no .env.production');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('❌ [FATAL] JWT_SECRET não definida em produção. Configure no .env.production');
    process.exit(1);
  }
  if (!process.env.API_SECRET) {
    console.error('❌ [FATAL] API_SECRET não definida em produção. Configure no .env.production');
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error('❌ [FATAL] NEXT_PUBLIC_APP_URL não definida em produção. Configure no .env.production');
    process.exit(1);
  }
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin: dev ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') : process.env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket ready on ws://${hostname}:${port}/api/socket`);
  });
});
