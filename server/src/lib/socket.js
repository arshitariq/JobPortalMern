const socketIO = require('socket.io');

let emitToChatImpl = () => {
  console.warn('emitToChat called before socket initialization');
};

let emitToUserImpl = () => {
  console.warn('emitToUser called before socket initialization');
};

const emitToChat = (chatId, event, data) => emitToChatImpl(chatId, event, data);
const emitToUser = (userId, event, data) => emitToUserImpl(userId, event, data);

module.exports.emitToChat = emitToChat;
module.exports.emitToUser = emitToUser;

module.exports.initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const userSockets = new Map(); // userId -> socketId
  const userRooms = new Map(); // userId -> [chatIds]
  const onlineUsers = new Set();

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    
    const userId = socket.handshake.auth?.userId;
    
    if (!userId) {
      console.log('No userId provided, disconnecting');
      socket.disconnect();
      return;
    }

    // Store user socket
    userSockets.set(userId, socket.id);
    onlineUsers.add(userId);
    
    console.log(`User ${userId} connected as socket ${socket.id}`);
    
    // Join user to their personal room
    socket.join(`user:${userId}`);
    
    // Notify all users about this user's online status
    io.emit('user-status-change', {
      userId,
      status: 'online',
      lastSeen: null
    });

    // ========== CHAT EVENTS ==========
    
    // Join specific chat room
    socket.on('join-chat', (chatId) => {
      if (!chatId) return;
      
      socket.join(`chat:${chatId}`);
      
      // Store chat room for user
      if (!userRooms.has(userId)) {
        userRooms.set(userId, new Set());
      }
      userRooms.get(userId).add(chatId);
      
      console.log(`User ${userId} joined chat: ${chatId}`);
    });

    // Join multiple chats
    socket.on('join-chats', (chatIds) => {
      if (!Array.isArray(chatIds)) return;
      
      chatIds.forEach(chatId => {
        socket.join(`chat:${chatId}`);
        
        if (!userRooms.has(userId)) {
          userRooms.set(userId, new Set());
        }
        userRooms.get(userId).add(chatId);
      });
      
      console.log(`User ${userId} joined chats: ${chatIds.join(', ')}`);
    });

    // Send message
    socket.on('send-message', (data) => {
      const { chatId, message, receiverId } = data;
      
      if (!chatId || !message) return;
      
      console.log(`Message from ${userId} to chat ${chatId}`);
      
      // Emit to everyone in the chat room
      io.to(`chat:${chatId}`).emit('receive-message', {
        chatId,
        message,
        senderId: userId
      });
      
      // Send notification to receiver if they're not in the chat room
      if (receiverId && receiverId !== userId) {
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new-message-notification', {
            chatId,
            message,
            senderId: userId
          });
        }
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      
      if (!chatId) return;
      
      // Broadcast typing status to other users in chat
      socket.to(`chat:${chatId}`).emit('user-typing', {
        userId,
        chatId,
        isTyping
      });
    });

    // Mark message as read
    socket.on('mark-read', (data) => {
      const { messageId, chatId } = data;
      
      if (!messageId || !chatId) return;
      
      io.to(`chat:${chatId}`).emit('message-read', {
        messageId,
        readBy: userId,
        readAt: new Date()
      });
    });

    // Mark chat as read
    socket.on('mark-chat-read', (chatId) => {
      if (!chatId) return;
      
      io.to(`chat:${chatId}`).emit('chat-read', {
        chatId,
        readBy: userId,
        readAt: new Date()
      });
    });

    // Message reactions
    socket.on('add-reaction', (data) => {
      const { messageId, emoji, chatId } = data;
      
      if (!messageId || !emoji || !chatId) return;
      
      io.to(`chat:${chatId}`).emit('message-reaction-update', {
        messageId,
        emoji,
        userId,
        chatId,
        action: 'add'
      });
    });

    socket.on('remove-reaction', (data) => {
      const { messageId, chatId } = data;
      
      if (!messageId || !chatId) return;
      
      io.to(`chat:${chatId}`).emit('message-reaction-update', {
        messageId,
        userId,
        chatId,
        action: 'remove'
      });
    });

    // Delete message
    socket.on('delete-message', (data) => {
      const { messageId, chatId, deleteForEveryone } = data;
      
      if (!messageId || !chatId) return;
      
      io.to(`chat:${chatId}`).emit('message-deleted', {
        messageId,
        chatId,
        deletedBy: userId,
        deleteForEveryone,
        deletedAt: new Date()
      });
    });

    // ========== CALL EVENTS ==========
    
    // Call user
    socket.on('call-user', (data) => {
      const { userToCall, signalData, from, name, type, callId } = data;
      
      if (!userToCall || !signalData || !from) return;
      
      console.log(`Call from ${from} to ${userToCall}, type: ${type}`);
      
      const receiverSocketId = userSockets.get(userToCall);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', {
          from,
          name: name || 'User',
          signal: signalData,
          type: type || 'video',
          callId: callId || Date.now().toString()
        });
      }
    });

    // Answer call
    socket.on('answer-call', (data) => {
      const { to, signal, callId } = data;
      
      if (!to || !signal) return;
      
      console.log(`Call answer from ${userId} to ${to}`);
      
      const receiverSocketId = userSockets.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-accepted', {
          signal,
          callId,
          from: userId
        });
      }
    });

    // Reject call
    socket.on('reject-call', (data) => {
      const { to, callId } = data;
      
      if (!to) return;
      
      const receiverSocketId = userSockets.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-rejected', {
          callId,
          by: userId
        });
      }
    });

    // End call
    socket.on('end-call', (data) => {
      const { to, callId } = data;
      
      console.log(`Call ended by ${userId} to ${to}`);
      
      if (to) {
        const receiverSocketId = userSockets.get(to);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('call-ended', {
            callId,
            by: userId,
            duration: 0
          });
        }
      }
      
      // Also broadcast to any group call participants if needed
      if (callId) {
        io.to(`call:${callId}`).emit('call-ended', {
          callId,
          by: userId,
          duration: 0
        });
      }
    });

    // ========== STATUS EVENTS ==========
    
    // User online status
    socket.on('user-connected', (id) => {
      const uid = id || userId;
      if (!uid) return;
      
      onlineUsers.add(uid);
      userSockets.set(uid, socket.id);
      
      io.emit('user-status-change', {
        userId: uid,
        status: 'online',
        lastSeen: null
      });
    });

    // User typing status
    socket.on('user-typing', (data) => {
      const { chatId, isTyping } = data;
      
      if (!chatId) return;
      
      socket.to(`chat:${chatId}`).emit('user-typing', {
        userId,
        chatId,
        isTyping
      });
    });

    // ========== DISCONNECT ==========
    
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      
      onlineUsers.delete(userId);
      userSockets.delete(userId);
      userRooms.delete(userId);
      
      // Notify all users about offline status
      io.emit('user-status-change', {
        userId,
        status: 'offline',
        lastSeen: new Date()
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  const emitToUserFn = (userId, event, data) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  };

  // Helper function to emit to chat room
  const emitToChatFn = (chatId, event, data) => {
    io.to(`chat:${chatId}`).emit(event, data);
  };

  emitToChatImpl = emitToChatFn;
  emitToUserImpl = emitToUserFn;

  return {
    io,
    emitToUser: emitToUserFn,
    emitToChat: emitToChatFn,
    getOnlineUsers: () => Array.from(onlineUsers),
    isUserOnline: (userId) => onlineUsers.has(userId)
  };
};
