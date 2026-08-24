import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext.js';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (payload: {
    conversationId: string;
    content: string;
    messageType?: string;
    replyToId?: string | null;
    attachments?: any[];
  }) => Promise<any>;
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinConversation: () => {},
  leaveConversation: () => {},
  sendMessage: async () => {},
  sendTypingStart: () => {},
  sendTypingStop: () => {},
  markConversationAsRead: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { customer, adminUser } = useAuth();

  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [customer?.id, adminUser?.id]);

  const joinConversation = (conversationId: string) => {
    if (socket && conversationId) {
      socket.emit('conversation:join', { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && conversationId) {
      socket.emit('conversation:leave', { conversationId });
    }
  };

  const sendMessage = (payload: {
    conversationId: string;
    content: string;
    messageType?: string;
    replyToId?: string | null;
    attachments?: any[];
  }) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected'));
      socket.emit('message:send', payload, (response: any) => {
        if (response?.success) {
          resolve(response.message);
        } else {
          reject(new Error(response?.error || 'Failed to send message'));
        }
      });
    });
  };

  const sendTypingStart = (conversationId: string) => {
    if (socket && conversationId) {
      socket.emit('typing:start', { conversationId });
    }
  };

  const sendTypingStop = (conversationId: string) => {
    if (socket && conversationId) {
      socket.emit('typing:stop', { conversationId });
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    if (socket && conversationId) {
      socket.emit('message:read_all', { conversationId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        sendMessage,
        sendTypingStart,
        sendTypingStop,
        markConversationAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
