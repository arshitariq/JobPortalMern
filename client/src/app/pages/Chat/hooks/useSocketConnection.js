import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export default function useSocketConnection({ 
  socketUrl, 
  userId, 
  onMessage, 
  onCall, 
  onUserStatusChange 
}) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId || !socketUrl) return;

    const newSocket = io(socketUrl, {
      auth: { userId },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      newSocket.emit('user-connected', userId);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('receive-message', (data) => {
      onMessage?.(data);
    });

    newSocket.on('incoming-call', (data) => {
      onCall?.(data);
    });

    newSocket.on('call-ended', (data) => {
      console.log('Call ended:', data);
    });

    newSocket.on('user-status-change', (data) => {
      onUserStatusChange?.(data);
    });

    newSocket.on('typing', ({ userId: typingUserId, chatId, isTyping }) => {
      // Handle typing indicator
      console.log('Typing:', typingUserId, isTyping);
    });

    newSocket.on('message-read', ({ messageId, readBy }) => {
      // Handle read receipts
      console.log('Message read:', messageId, readBy);
    });

    return () => {
      if (newSocket) {
        newSocket.emit('user-offline', userId);
        newSocket.disconnect();
      }
    };
  }, [userId, socketUrl]);

  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  return { socket, isConnected, emit };
}