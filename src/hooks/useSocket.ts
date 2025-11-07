import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWeb3 } from '@/providers/Web3Provider';
import '../types/ethereum';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { account } = useWeb3();

  useEffect(() => {
    if (!account || typeof window === 'undefined' || !window.ethereum) return;

    const connectSocket = async () => {
      const ethereum = window.ethereum;
      if (!ethereum) {
        console.error('Ethereum provider not found');
        return;
      }

      try {
        // Create authentication message
        const message = `Connect to Kaleido Mining: ${account}`;
        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [message, account]
        });

        // Initialize socket connection with auth
        socketRef.current = io({
          path: '/api/socketio',
          addTrailingSlash: false,
          auth: {
            address: account,
            signature,
            message
          },
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: true,
          transports: ['websocket']
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socket.on('disconnect', (reason) => {
        });
      } catch (error) {
        console.error('Failed to connect socket:', error);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [account]);

  const onPointsUpdate = useCallback((callback: (points: number) => void) => {
    if (!socketRef.current) return;

    socketRef.current.on('points:update', ({ points }) => {
      callback(points);
    });

    return () => {
      socketRef.current?.off('points:update');
    };
  }, []);

  return {
    socket: socketRef.current,
    onPointsUpdate
  };
};
