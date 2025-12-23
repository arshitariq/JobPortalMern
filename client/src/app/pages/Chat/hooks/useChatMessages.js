import { useState, useCallback } from 'react';

export default function useChatMessages({ socket, currentUserId }) {
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  const addMessage = useCallback((chatId, message) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
  }, []);

  const updateMessage = useCallback((chatId, messageId, updates) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(msg => 
        msg._id === messageId || msg.id === messageId 
          ? { ...msg, ...updates } 
          : msg
      ) || []
    }));
  }, []);

  const deleteMessage = useCallback((chatId, messageId) => {
    if (messageId === 'all') {
      setMessages(prev => ({
        ...prev,
        [chatId]: []
      }));
      return;
    }

    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.filter(msg => 
        msg._id !== messageId && msg.id !== messageId
      ) || []
    }));
  }, []);

  const markAsRead = useCallback((chatId, messageId) => {
    updateMessage(chatId, messageId, { status: 'read' });
  }, [updateMessage]);

  return {
    messages,
    loadingMessages,
    setLoadingMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    setMessages
  };
}