import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

let io: SocketIOServer | null = null;

interface AuthPayload {
  address: string;
  signature: string;
  message: string;
}

export const initSocketServer = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const { address, signature, message } = socket.handshake.auth as AuthPayload;
      
      if (!address || !signature || !message) {
        return next(new Error('Authentication failed: Missing credentials'));
      }

      // Verify the signature using eth-sig-util
      const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'));
      const recoveredAddress = recoverPersonalSignature({
        data: msgBufferHex,
        signature: signature
      });
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return next(new Error('Authentication failed: Invalid signature'));
      }

      // Attach the address to the socket
      socket.data.address = address.toLowerCase();
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {

    // Join user's personal room
    const userRoom = `user:${socket.data.address}`;
    socket.join(userRoom);

    socket.on('disconnect', () => {
      socket.leave(userRoom);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitPointsUpdate = (userAddress: string, points: number) => {
  if (!io) return;
  
  const userRoom = `user:${userAddress.toLowerCase()}`;
  io.to(userRoom).emit('points:update', { points });
};
