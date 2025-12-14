import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './prisma';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  if (io) {
    return io;
  }

  let origin;
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('❌ [FATAL] NEXT_PUBLIC_APP_URL não definida em produção. Configure no .env.production');
      process.exit(1);
    }
    origin = process.env.NEXT_PUBLIC_APP_URL;
  } else {
    origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Start cleanup job for expired signals
  startCleanupJob();

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastSignal(signal: any) {
  if (io) {
    io.emit('new-signal', signal);
  }
}

export function broadcastSignalRemoved(signalId: string) {
  if (io) {
    io.emit('signal-removed', { signalId });
  }
}

// Cleanup job to remove signals older than 2 hours
function startCleanupJob() {
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Find expired signals
      const expiredSignals = await prisma.signal.findMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
        select: {
          id: true,
        },
      });

      if (expiredSignals.length > 0) {
        // Delete expired signals
        await prisma.signal.deleteMany({
          where: {
            expiresAt: {
              lt: now,
            },
          },
        });

        // Notify clients
        expiredSignals.forEach(signal => {
          broadcastSignalRemoved(signal.id);
        });

        console.log(`🗑️ Removed ${expiredSignals.length} expired signals`);
      }
    } catch (error) {
      console.error('Cleanup job error:', error);
    }
  }, 60 * 1000); // Run every minute
}
