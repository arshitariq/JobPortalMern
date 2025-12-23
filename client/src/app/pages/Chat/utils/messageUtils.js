const toValidDate = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getMessageStatus = (message, currentUserId) => {
  if (!message) return 'pending';
  
  const isSender = message.sender?._id === currentUserId || 
                   message.sender === currentUserId;
  
  if (!isSender) return 'received';
  
  if (message.readBy && message.readBy.length > 0) return 'read';
  if (message.deliveredAt) return 'delivered';
  if (message.sentAt) return 'sent';
  
  return 'pending';
};

export const formatTime = (timestamp) => {
  const date = toValidDate(timestamp);
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const shouldShowDateSeparator = (currentMsg, prevMsg) => {
  if (!currentMsg) return false;
  if (!prevMsg) return true;
  
  const currentDate = toValidDate(currentMsg.createdAt);
  const prevDate = toValidDate(prevMsg.createdAt);
  
  if (!currentDate || !prevDate) return true;
  return currentDate.toDateString() !== prevDate.toDateString();
};

export const getDateSeparatorText = (timestamp) => {
  const date = toValidDate(timestamp);
  if (!date) return '';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
};
