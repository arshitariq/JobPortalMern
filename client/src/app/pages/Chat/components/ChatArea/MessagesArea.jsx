import React, { useEffect } from 'react';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '../Common/LoadingSpinner';
import TypingIndicator from '../Common/TypingIndicator';
import { shouldShowDateSeparator, getDateSeparatorText } from '../../utils/messageUtils';

export default function MessagesArea({
  messages = [],
  loading = false,
  currentUserId,
  onReply,
  onDelete,
  onReact,
  messagesEndRef,
  typingUsers = {},
  selectedChat
}) {
  // Filter out deleted messages for current user
  const filteredMessages = messages.filter(msg => 
    !msg.deletedForMe && 
    (currentUserId ? msg.sender?._id !== currentUserId || !msg.deletedForSender : true)
  );

  // Check if anyone is typing
  const isTyping = selectedChat && Object.keys(typingUsers).some(userId => 
    userId !== currentUserId && 
    typingUsers[userId] && 
    selectedChat.participants?.some(p => 
      p.user?._id === userId || p.user === userId
    )
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !loading) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages.length, loading]);

  if (loading && filteredMessages.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-2">
        {filteredMessages.map((msg, index) => {
          const prevMsg = filteredMessages[index - 1];
          const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);
          
          return (
            <React.Fragment key={msg._id || msg.id}>
              <MessageBubble
                message={msg}
                isMyMessage={msg.sender?._id === currentUserId || msg.sender === currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                onReact={onReact}
                showDateSeparator={showDateSeparator}
                dateSeparatorText={showDateSeparator ? getDateSeparatorText(msg.createdAt) : ''}
              />
            </React.Fragment>
          );
        })}
        
        {isTyping && (
          <TypingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}