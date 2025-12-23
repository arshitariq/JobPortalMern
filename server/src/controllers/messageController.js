const Message = require('../models/Message');
const Chat = require('../models/Chat');
const path = require('path');
const { 
  cloudinary,
  uploadChatImage, 
  uploadChatFile, 
  uploadChatVideo,
  deleteFile,
  generateVideoThumbnail
} = require('../lib/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { emitToChat } = require('../lib/socket');

const broadcastMessage = (chatId, message) => {
  const payload = message?.toObject ? message.toObject() : message;
  emitToChat(chatId.toString(), 'receive-message', {
    chatId: chatId.toString(),
    message: payload,
  });
};

const ALLOWED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.webm']);

const uploadAudioBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const format = ext ? ext.slice(1) : undefined;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'jobportal/chat/audio',
        ...(format ? { format } : {})
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

// @desc    Send a text message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content, type = 'text', replyTo } = req.body;
  const userId = req.user._id;

  // Validate chat exists and user is participant
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const isParticipant = chat.participants.some(
    p => p.user.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this chat');
  }

  // Get receiver (other participant in private chat)
  const receiver = chat.participants.find(
    p => p.user.toString() !== userId.toString()
  )?.user;

  // Create message
  const message = await Message.create({
    chatId,
    sender: userId,
    receiver,
    content,
    type,
    replyTo,
    status: 'sent'
  });

  // Update chat's last message
  await chat.updateLastMessage(message);

  // Populate sender info
  await message.populate('sender', 'name userName profileImage');
  if (replyTo) {
    await message.populate('replyTo');
  }

  broadcastMessage(chatId, message);

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Upload and send image message
// @route   POST /api/messages/upload/image
// @access  Private
exports.sendImageMessage = [
  uploadChatImage.single('image'),
  asyncHandler(async (req, res) => {
    const { chatId, caption } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      throw new ApiError(400, 'No image file provided');
    }

    // Validate chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      // Delete uploaded file if user is not authorized
      await deleteFile(req.file.filename);
      throw new ApiError(403, 'You are not a participant in this chat');
    }

    const receiver = chat.participants.find(
      p => p.user.toString() !== userId.toString()
    )?.user;

    // Create message with image
    const message = await Message.create({
      chatId,
      sender: userId,
      receiver,
      content: caption || '📷 Image',
      type: 'image',
      media: [{
        type: 'image',
        url: req.file.path,
        cloudinaryId: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        width: req.file.width,
        height: req.file.height
      }],
      status: 'sent'
    });

    await chat.updateLastMessage(message);
    await message.populate('sender', 'name userName profileImage');

    broadcastMessage(chatId, message);

    res.status(201).json({
      success: true,
      data: message
    });
  })
];

// @desc    Upload and send file message
// @route   POST /api/messages/upload/file
// @access  Private
exports.sendFileMessage = [
  uploadChatFile.single('file'),
  asyncHandler(async (req, res) => {
    const { chatId, caption } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      throw new ApiError(400, 'No file provided');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      await deleteFile(req.file.filename, 'raw');
      throw new ApiError(404, 'Chat not found');
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      await deleteFile(req.file.filename, 'raw');
      throw new ApiError(403, 'You are not a participant in this chat');
    }

    const receiver = chat.participants.find(
      p => p.user.toString() !== userId.toString()
    )?.user;

    let uploadResult;
    try {
      uploadResult = await uploadAudioBuffer(req.file);
    } catch (error) {
      console.error('Cloudinary audio upload failed:', error);
      throw new ApiError(500, 'Audio upload failed');
    }

    const message = await Message.create({
      chatId,
      sender: userId,
      receiver,
      content: caption || `📎 ${req.file.originalname}`,
      type: 'file',
      media: [{
        type: 'file',
        url: req.file.path,
        cloudinaryId: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }],
      status: 'sent'
    });

    await chat.updateLastMessage(message);
    await message.populate('sender', 'name userName profileImage');

    broadcastMessage(chatId, message);

    res.status(201).json({
      success: true,
      data: message
    });
  })
];

// @desc    Upload and send audio message
// @route   POST /api/messages/upload/audio
// @access  Private
exports.sendAudioMessage = asyncHandler(async (req, res) => {
    const { chatId, duration } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      throw new ApiError(400, 'No audio file provided');
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    if (ext && !ALLOWED_AUDIO_EXTENSIONS.has(ext)) {
      throw new ApiError(400, 'Invalid audio format. Use mp3, wav, ogg, or webm.');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ApiError(403, 'You are not a participant in this chat');
    }

    const receiver = chat.participants.find(
      p => p.user.toString() !== userId.toString()
    )?.user;

    let uploadResult;
    try {
      uploadResult = await uploadAudioBuffer(req.file);
    } catch (error) {
      console.error('Cloudinary audio upload failed:', error);
      throw new ApiError(500, 'Audio upload failed');
    }

    const message = await Message.create({
      chatId,
      sender: userId,
      receiver,
      content: '🎤 Voice message',
      type: 'voice',
      media: [{
        type: 'voice',
        url: uploadResult.secure_url || uploadResult.url,
        cloudinaryId: uploadResult.public_id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        duration: parseInt(duration) || 0
      }],
      status: 'sent'
    });

    await chat.updateLastMessage(message);
    await message.populate('sender', 'name userName profileImage');

    broadcastMessage(chatId, message);

    res.status(201).json({
      success: true,
      data: message
    });
});

// @desc    Upload and send video message
// @route   POST /api/messages/upload/video
// @access  Private
exports.sendVideoMessage = [
  uploadChatVideo.single('video'),
  asyncHandler(async (req, res) => {
    const { chatId, caption, duration } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      throw new ApiError(400, 'No video file provided');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      await deleteFile(req.file.filename, 'video');
      throw new ApiError(404, 'Chat not found');
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      await deleteFile(req.file.filename, 'video');
      throw new ApiError(403, 'You are not a participant in this chat');
    }

    const receiver = chat.participants.find(
      p => p.user.toString() !== userId.toString()
    )?.user;

    // Generate thumbnail
    const thumbnailUrl = generateVideoThumbnail(req.file.filename);

    const message = await Message.create({
      chatId,
      sender: userId,
      receiver,
      content: caption || '🎥 Video',
      type: 'video',
      media: [{
        type: 'video',
        url: req.file.path,
        cloudinaryId: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        thumbnail: thumbnailUrl,
        duration: parseInt(duration) || 0,
        width: req.file.width,
        height: req.file.height
      }],
      status: 'sent'
    });

    await chat.updateLastMessage(message);
    await message.populate('sender', 'name userName profileImage');

    broadcastMessage(chatId, message);

    res.status(201).json({
      success: true,
      data: message
    });
  })
];

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
exports.getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { limit = 50, skip = 0 } = req.query;
  const userId = req.user._id;

  // Validate chat access
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const isParticipant = chat.participants.some(
    p => p.user.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this chat');
  }

  const messages = await Message.getChatMessages(
    chatId,
    userId,
    parseInt(limit),
    parseInt(skip)
  );

  res.json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.receiver.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only mark your received messages as read');
  }

  await message.markAsRead(userId);
  emitToChat(message.chatId.toString(), 'message-read-update', {
    messageId,
    readBy: userId.toString(),
    readAt: new Date().toISOString()
  });

  res.json({
    success: true,
    data: message
  });
});

// @desc    Mark all chat messages as read
// @route   PUT /api/messages/chat/:chatId/read-all
// @access  Private
exports.markChatAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  await Message.markChatAsRead(chatId, userId);
  await chat.markAsRead(userId);
  emitToChat(chatId.toString(), 'message-read-update', {
    chatId: chatId.toString(),
    readBy: userId.toString(),
    readAt: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'All messages marked as read'
  });
});

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { deleteForEveryone = false } = req.body;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only delete your own messages');
  }

  if (deleteForEveryone) {
    // Delete media files from Cloudinary if exists
    if (message.media && message.media.length > 0) {
      for (const media of message.media) {
        if (media.cloudinaryId) {
          const resourceType = media.type === 'image' ? 'image' : 
                              media.type === 'video' ? 'video' : 'raw';
          await deleteFile(media.cloudinaryId, resourceType);
        }
      }
    }
    await message.deleteForEveryone();
  } else {
    await message.deleteForUser(userId);
  }

  emitToChat(message.chatId.toString(), 'message-deleted', {
    chatId: message.chatId.toString(),
    messageId,
    deleteForEveryone,
    deletedAt: new Date().toISOString()
  });

  res.json({
    success: true,
    message: deleteForEveryone ? 
      'Message deleted for everyone' : 
      'Message deleted for you'
  });
});

// @desc    React to message
// @route   PUT /api/messages/:messageId/react
// @access  Private
exports.reactToMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user._id;

  if (!emoji) {
    throw new ApiError(400, 'Emoji is required');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  await message.addReaction(userId, emoji);
  emitToChat(message.chatId.toString(), 'message-reaction-update', {
    messageId,
    reactions: message.reactions
  });

  res.json({
    success: true,
    data: message
  });
});

// @desc    Remove reaction from message
// @route   DELETE /api/messages/:messageId/react
// @access  Private
exports.removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  await message.removeReaction(userId);
  emitToChat(message.chatId.toString(), 'message-reaction-update', {
    messageId,
    reactions: message.reactions
  });

  res.json({
    success: true,
    data: message
  });
});

// @desc    Edit message
// @route   PUT /api/messages/:messageId
// @access  Private
exports.editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Content is required');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only edit your own messages');
  }

  if (message.type !== 'text') {
    throw new ApiError(400, 'Only text messages can be edited');
  }

  await message.editMessage(content);

  res.json({
    success: true,
    data: message
  });
});

// @desc    Forward message
// @route   POST /api/messages/:messageId/forward
// @access  Private
exports.forwardMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { targetChatId } = req.body;
  const userId = req.user._id;

  if (!targetChatId) {
    throw new ApiError(400, 'Target chat ID is required');
  }

  const originalMessage = await Message.findById(messageId);
  if (!originalMessage) {
    throw new ApiError(404, 'Message not found');
  }

  const targetChat = await Chat.findById(targetChatId);
  if (!targetChat) {
    throw new ApiError(404, 'Target chat not found');
  }

  const isParticipant = targetChat.participants.some(
    p => p.user.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in the target chat');
  }

  const receiver = targetChat.participants.find(
    p => p.user.toString() !== userId.toString()
  )?.user;

  // Create forwarded message
  const forwardedMessage = await Message.create({
    chatId: targetChatId,
    sender: userId,
    receiver,
    content: originalMessage.content,
    type: originalMessage.type,
    media: originalMessage.media,
    isForwarded: true,
    originalSender: originalMessage.sender,
    status: 'sent'
  });

  await targetChat.updateLastMessage(forwardedMessage);
  await forwardedMessage.populate('sender', 'name userName profileImage');
  await forwardedMessage.populate('originalSender', 'name userName profileImage');

  broadcastMessage(targetChatId, forwardedMessage);

  res.status(201).json({
    success: true,
    data: forwardedMessage
  });
});

// @desc    Search messages in chat
// @route   GET /api/messages/search/:chatId
// @access  Private
exports.searchMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { q: searchTerm } = req.query;
  const userId = req.user._id;

  if (!searchTerm) {
    throw new ApiError(400, 'Search term is required');
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const isParticipant = chat.participants.some(
    p => p.user.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this chat');
  }

  const messages = await Message.searchMessages(chatId, userId, searchTerm);

  res.json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await Message.getUnreadCount(userId);

  res.json({
    success: true,
    data: { unreadCount: count }
  });
});

module.exports = exports;
