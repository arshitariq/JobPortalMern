import { useState, useRef, useCallback } from 'react';

export default function useTypingDetection({ socket, chatId, userId, onTypingChange }) {
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);

  // Send typing status to server
  const sendTypingStatus = useCallback((isTyping) => {
    if (!socket || !chatId || !userId) return;

    socket.emit('typing', { 
      chatId, 
      isTyping,
      userId 
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send "stopped typing" after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    }
  }, [socket, chatId, userId]);

  // Handle incoming typing status from other users
  const handleIncomingTyping = useCallback(({ userId: typingUserId, chatId: typingChatId, isTyping }) => {
    if (typingChatId !== chatId) return;

    setTypingUsers(prev => {
      const newState = { ...prev };
      
      if (isTyping) {
        newState[typingUserId] = true;
        
        // Clear any existing timeout for this user
        if (prev[typingUserId]) {
          clearTimeout(prev[typingUserId]);
        }
        
        // Set timeout to remove typing status after 3 seconds
        const timeoutId = setTimeout(() => {
          setTypingUsers(current => {
            const updated = { ...current };
            delete updated[typingUserId];
            return updated;
          });
        }, 3000);
        
        // Store timeout ID in state (we'll use a separate ref for actual timeout)
        newState[`${typingUserId}_timeout`] = timeoutId;
      } else {
        // Clear timeout and remove user
        if (prev[`${typingUserId}_timeout`]) {
          clearTimeout(prev[`${typingUserId}_timeout`]);
        }
        delete newState[typingUserId];
        delete newState[`${typingUserId}_timeout`];
      }
      
      return newState;
    });

    // Call external callback if provided
    onTypingChange?.(typingUserId, isTyping);
  }, [chatId, onTypingChange]);

  // Cleanup timeouts
  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Clear all user timeouts
    Object.values(typingUsers).forEach(timeoutId => {
      if (typeof timeoutId === 'number') {
        clearTimeout(timeoutId);
      }
    });
    
    setTypingUsers({});
  }, [typingUsers]);

  // Get typing users for current chat
  const getTypingUsers = useCallback(() => {
    return Object.keys(typingUsers).filter(key => 
      !key.endsWith('_timeout') && typingUsers[key] === true
    );
  }, [typingUsers]);

  // Check if specific user is typing
  const isUserTyping = useCallback((userId) => {
    return typingUsers[userId] === true;
  }, [typingUsers]);

  // Get typing text
  const getTypingText = useCallback((userNames = {}) => {
    const typingUserIds = getTypingUsers();
    
    if (typingUserIds.length === 0) return '';
    
    if (typingUserIds.length === 1) {
      const userName = userNames[typingUserIds[0]] || 'Someone';
      return `${userName} is typing...`;
    }
    
    if (typingUserIds.length === 2) {
      const name1 = userNames[typingUserIds[0]] || 'Someone';
      const name2 = userNames[typingUserIds[1]] || 'Someone';
      return `${name1} and ${name2} are typing...`;
    }
    
    return `${typingUserIds.length} people are typing...`;
  }, [getTypingUsers]);

  return {
    typingUsers: getTypingUsers(),
    sendTypingStatus,
    handleIncomingTyping,
    isUserTyping,
    getTypingText,
    cleanup
  };
}