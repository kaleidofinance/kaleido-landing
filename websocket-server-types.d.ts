import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';
import { Db } from 'mongodb';

export interface SocketData {
  wallet: string;
  balance?: number;
  state?: any;
}

export interface WebSocketServer {
  httpServer: HttpServer;
  io: Socket;
  db: Db;
}
