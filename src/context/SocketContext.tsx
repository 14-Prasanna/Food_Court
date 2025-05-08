import { createContext, useContext, useRef, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-food-court.onrender.com';

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    socket.current = io(BASE_URL, {
      path: '/socket.io',
      transports: ['polling'], // Force polling to avoid WebSocket issues on Render
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Handle connection events
    const handleConnect = () => {
      console.log('Connected to Socket.IO server:', socket.current?.id);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from Socket.IO server:', socket.current?.id);
    };

    const handleReconnect = () => {
      console.log('Reconnected to Socket.IO server:', socket.current?.id);
    };

    const handleConnectError = (error: any) => {
      console.error('Socket.IO connection error:', error);
      if (error.message) {
        console.error('Error message:', error.message);
      }
      if (error.description) {
        console.error('Error description:', error.description);
      }
    };

    socket.current.on('connect', handleConnect);
    socket.current.on('disconnect', handleDisconnect);
    socket.current.on('reconnect', handleReconnect);
    socket.current.on('connect_error', handleConnectError);

    return () => {
      socket.current?.off('connect', handleConnect);
      socket.current?.off('disconnect', handleDisconnect);
      socket.current?.off('reconnect', handleReconnect);
      socket.current?.off('connect_error', handleConnectError);
      socket.current?.disconnect();
      socket.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
