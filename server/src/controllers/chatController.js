const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Employer = require('../models/Employer');
const { uploadChatImage, deleteFile } = require('../lib/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return value._id.toString();
    if (value.id) return value.id.toString();
  }
  return value?.toString?.() || null;
};

const getOtherParticipantId = (chat, currentUserId) => {
  const normalizedCurrentId = normalizeId(currentUserId);
  if (!chat?.participants?.length) return null;

  for (const participant of chat.participants) {
    const participantId = normalizeId(participant.user || participant);
    if (!participantId) continue;
    if (participantId !== normalizedCurrentId) {
      return participantId;
    }
  }

  return null;
};

const buildEmployerMap = async (userIds = []) => {
  if (!userIds.length) return new Map();

  const employers = await Employer.find({ userId: { $in: userIds } }).select(
    "companyName avatarUrl logoUrl media"
  );

  const entries = employers
    .filter((employer) => employer.userId)
    .map((employer) => [employer.userId.toString(), employer]);

  return new Map(entries);
};

const attachEmployerMeta = (chatObj, currentUserId, employerMap) => {
  const normalizedCurrentId = normalizeId(currentUserId);
  const otherParticipant = (chatObj.participants || []).find((participant) => {
    const participantId = normalizeId(participant.user || participant);
    return participantId && participantId !== normalizedCurrentId;
  });

  if (!otherParticipant) return chatObj;

  const otherUserId = normalizeId(otherParticipant.user);
  const employerProfile = otherUserId ? employerMap.get(otherUserId) : null;

  chatObj.partnerRole =
    otherParticipant.user?.role ||
    otherParticipant.role ||
    chatObj.partnerRole ||
    "member";
  chatObj.role = chatObj.role || chatObj.partnerRole;
  chatObj.name = chatObj.name || otherParticipant?.user?.name || chatObj.name;

  if (employerProfile) {
    chatObj.company = employerProfile.companyName || chatObj.company || "";
    chatObj.companyAvatar =
      employerProfile.avatarUrl ||
      employerProfile.logoUrl ||
      employerProfile.media?.logoVariants?.primary ||
      chatObj.companyAvatar ||
      "";
  }

  return chatObj;
};

// @desc    Get all chats for user
// @route   GET /api/chats
// @access  Private
exports.getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { includeArchived = false, limit = 50, skip = 0 } = req.query;

  const chats = await Chat.getUserChats(userId, {
    includeArchived: includeArchived === 'true',
    limit: parseInt(limit),
    skip: parseInt(skip)
  });

  // Add unread count for each chat
  const chatsWithUnread = chats.map(chat => {
    const chatObj = chat.toObject();
    chatObj.unreadCount = chat.getUnreadCount(userId);
    const archivedBy = Array.isArray(chat.archivedBy) ? chat.archivedBy : [];
    const pinnedBy = Array.isArray(chat.pinnedBy) ? chat.pinnedBy : [];
    chatObj.isArchived = archivedBy.some(
      a => a.user.toString() === userId.toString()
    );
    chatObj.isPinnedByUser = pinnedBy.some(
      p => p.user.toString() === userId.toString()
    );
    return chatObj;
  });

  const otherUserIds = new Set();
  chatsWithUnread.forEach((chat) => {
    const otherId = getOtherParticipantId(chat, userId);
    if (otherId) otherUserIds.add(otherId);
  });

  const employerMap = await buildEmployerMap(Array.from(otherUserIds));

  const enrichedChats = chatsWithUnread.map((chat) =>
    attachEmployerMeta(chat, userId, employerMap)
  );

  res.json({
    success: true,
    count: enrichedChats.length,
    data: enrichedChats
  });
});

// @desc    Get or create private chat
// @route   POST /api/chats/private
// @access  Private
exports.getOrCreatePrivateChat = asyncHandler(async (req, res) => {
  const { userId: otherUserId } = req.body;
  const currentUserId = req.user._id;

  if (!otherUserId) {
    throw new ApiError(400, 'User ID is required');
  }

  if (otherUserId === currentUserId.toString()) {
    throw new ApiError(400, 'Cannot create chat with yourself');
  }

  // Verify other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    throw new ApiError(404, 'User not found');
  }

  const chat = await Chat.findOrCreatePrivateChat(currentUserId, otherUserId);

  // Add unread count
  const chatObj = chat.toObject();
  chatObj.unreadCount = chat.getUnreadCount(currentUserId);

  res.json({
    success: true,
    data: chatObj
  });
});

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
exports.createGroupChat = asyncHandler(async (req, res) => {
  const { name, description, participantIds } = req.body;
  const currentUserId = req.user._id;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Group name is required');
  }

  if (!participantIds || participantIds.length < 1) {
    throw new ApiError(400, 'At least one other participant is required');
  }

  // Verify all participants exist
  const participants = await User.find({ _id: { $in: participantIds } });
  if (participants.length !== participantIds.length) {
    throw new ApiError(404, 'One or more participants not found');
  }

  // Create participant array with creator as admin
  const participantArray = [
    { user: currentUserId, role: 'admin' },
    ...participantIds.map(id => ({ user: id, role: 'member' }))
  ];

  const chat = await Chat.create({
    type: 'group',
    name,
    description,
    participants: participantArray,
    createdBy: currentUserId,
    admins: [currentUserId]
  });

  await chat.populate('participants.user', 'name userName profileImage');

  res.status(201).json({
    success: true,
    data: chat
  });
});

// @desc    Get single chat
// @route   GET /api/chats/:chatId
// @access  Private
exports.getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId)
    .populate('participants.user', 'name userName profileImage')
    .populate('createdBy', 'name userName profileImage')
    .populate('admins', 'name userName profileImage');

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const isParticipant = chat.participants.some(
    p => p.user._id.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new ApiError(403, 'You are not a participant in this chat');
  }

  const chatObj = chat.toObject();
  chatObj.unreadCount = chat.getUnreadCount(userId);

  const otherParticipantId = getOtherParticipantId(chatObj, userId);
  const employerMap = otherParticipantId
    ? await buildEmployerMap([otherParticipantId])
    : new Map();

  const enrichedChat = attachEmployerMeta(chatObj, userId, employerMap);

  res.json({
    success: true,
    data: enrichedChat
  });
});

// @desc    Update group chat
// @route   PUT /api/chats/:chatId
// @access  Private
exports.updateGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  if (chat.type !== 'group') {
    throw new ApiError(400, 'Can only update group chats');
  }

  // Check if user is admin
  const isAdmin = chat.admins.some(
    adminId => adminId.toString() === userId.toString()
  );
  if (!isAdmin) {
    throw new ApiError(403, 'Only admins can update group info');
  }

  if (name) chat.name = name;
  if (description !== undefined) chat.description = description;

  await chat.save();
  await chat.populate('participants.user', 'name userName profileImage');

  res.json({
    success: true,
    data: chat
  });
});

// @desc    Upload group avatar
// @route   PUT /api/chats/:chatId/avatar
// @access  Private
exports.uploadGroupAvatar = [
  uploadChatImage.single('avatar'),
  asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!req.file) {
      throw new ApiError(400, 'No avatar file provided');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      await deleteFile(req.file.filename);
      throw new ApiError(404, 'Chat not found');
    }

    if (chat.type !== 'group') {
      await deleteFile(req.file.filename);
      throw new ApiError(400, 'Can only update group avatars');
    }

    const isAdmin = chat.admins.some(
      adminId => adminId.toString() === userId.toString()
    );
    if (!isAdmin) {
      await deleteFile(req.file.filename);
      throw new ApiError(403, 'Only admins can update group avatar');
    }

    // Delete old avatar if exists
    if (chat.avatar?.cloudinaryId) {
      await deleteFile(chat.avatar.cloudinaryId);
    }

    chat.avatar = {
      url: req.file.path,
      cloudinaryId: req.file.filename
    };

    await chat.save();

    res.json({
      success: true,
      data: chat
    });
  })
];

// @desc    Add participants to group
// @route   POST /api/chats/:chatId/participants
// @access  Private
exports.addParticipants = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { participantIds } = req.body;
  const userId = req.user._id;

  if (!participantIds || participantIds.length === 0) {
    throw new ApiError(400, 'Participant IDs are required');
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  if (chat.type !== 'group') {
    throw new ApiError(400, 'Can only add participants to group chats');
  }

  // Check permissions
  const participant = chat.participants.find(
    p => p.user.toString() === userId.toString()
  );
  if (!participant?.permissions?.canAddMembers) {
    throw new ApiError(403, 'You do not have permission to add members');
  }

  // Verify new participants exist
  const newParticipants = await User.find({ _id: { $in: participantIds } });
  if (newParticipants.length !== participantIds.length) {
    throw new ApiError(404, 'One or more participants not found');
  }

  // Add participants
  for (const participantId of participantIds) {
    await chat.addParticipant(participantId);
  }

  await chat.populate('participants.user', 'name userName profileImage');

  res.json({
    success: true,
    data: chat
  });
});

// @desc    Remove participant from group
// @route   DELETE /api/chats/:chatId/participants/:participantId
// @access  Private
exports.removeParticipant = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  if (chat.type !== 'group') {
    throw new ApiError(400, 'Can only remove participants from group chats');
  }

  // Check if user is removing themselves or has permission
  const isSelf = participantId === userId.toString();
  const participant = chat.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (!isSelf && !participant?.permissions?.canRemoveMembers) {
    throw new ApiError(403, 'You do not have permission to remove members');
  }

  await chat.removeParticipant(participantId);
  await chat.populate('participants.user', 'name userName profileImage');

  res.json({
    success: true,
    data: chat
  });
});

// @desc    Make user admin
// @route   PUT /api/chats/:chatId/admins/:participantId
// @access  Private
exports.makeAdmin = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  if (chat.type !== 'group') {
    throw new ApiError(400, 'Can only manage admins in group chats');
  }

  const isAdmin = chat.admins.some(
    adminId => adminId.toString() === userId.toString()
  );
  if (!isAdmin) {
    throw new ApiError(403, 'Only admins can make others admin');
  }

  await chat.makeAdmin(participantId);
  await chat.populate('participants.user', 'name userName profileImage');

  res.json({
    success: true,
    data: chat
  });
});

// @desc    Remove admin
// @route   DELETE /api/chats/:chatId/admins/:participantId
// @access  Private
exports.removeAdmin = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const isAdmin = chat.admins.some(
    adminId => adminId.toString() === userId.toString()
  );
  if (!isAdmin) {
    throw new ApiError(403, 'Only admins can remove admin rights');
  }

  if (chat.createdBy.toString() === participantId) {
    throw new ApiError(400, 'Cannot remove admin rights from group creator');
  }

  await chat.removeAdmin(participantId);
  await chat.populate('participants.user', 'name userName profileImage');

  res.json({
    success: true,
    data: chat
  });
});

// @desc    Mute/Unmute chat notifications
// @route   PUT /api/chats/:chatId/mute
// @access  Private
exports.toggleMute = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { mute = true, duration } = req.body;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  if (mute) {
    await chat.muteNotifications(userId, duration);
  } else {
    await chat.unmuteNotifications(userId);
  }

  res.json({
    success: true,
    message: mute ? 'Chat muted' : 'Chat unmuted'
  });
});

// @desc    Archive/Unarchive chat
// @route   PUT /api/chats/:chatId/archive
// @access  Private
exports.toggleArchive = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { archive = true } = req.body;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  await chat.toggleArchive(userId, archive);

  res.json({
    success: true,
    message: archive ? 'Chat archived' : 'Chat unarchived'
  });
});

// @desc    Pin/Unpin chat
// @route   PUT /api/chats/:chatId/pin
// @access  Private
exports.togglePin = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { pin = true } = req.body;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  await chat.togglePin(userId, pin);

  res.json({
    success: true,
    message: pin ? 'Chat pinned' : 'Chat unpinned'
  });
});

// @desc    Delete chat
// @route   DELETE /api/chats/:chatId
// @access  Private
exports.deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { deleteForEveryone = false } = req.body;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  if (deleteForEveryone) {
    // Only creator can delete for everyone
    if (chat.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only creator can delete chat for everyone');
    }

    // Delete all messages and their media
    const messages = await Message.find({ chatId });
    for (const message of messages) {
      if (message.media && message.media.length > 0) {
        for (const media of message.media) {
          if (media.cloudinaryId) {
            const resourceType = media.type === 'image' ? 'image' : 
                                media.type === 'video' ? 'video' : 'raw';
            await deleteFile(media.cloudinaryId, resourceType);
          }
        }
      }
    }
    await Message.deleteMany({ chatId });

    // Delete chat avatar if exists
    if (chat.avatar?.cloudinaryId) {
      await deleteFile(chat.avatar.cloudinaryId);
    }

    await chat.deleteOne();
  } else {
    // Just mark as deleted for current user
    if (!chat.deletedFor.includes(userId)) {
      chat.deletedFor.push(userId);
      await chat.save();
    }
  }

  res.json({
    success: true,
    message: deleteForEveryone ? 
      'Chat deleted for everyone' : 
      'Chat deleted for you'
  });
});

// @desc    Clear chat history
// @route   POST /api/chats/:chatId/clear
// @access  Private
exports.clearChatHistory = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

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

  // Mark all messages as deleted for this user
  await Message.updateMany(
    { 
      chatId,
      deletedFor: { $ne: userId }
    },
    { $push: { deletedFor: userId } }
  );

  res.json({
    success: true,
    message: 'Chat history cleared'
  });
});

// @desc    Search chats
// @route   GET /api/chats/search
// @access  Private
exports.searchChats = asyncHandler(async (req, res) => {
  const { q: searchTerm } = req.query;
  const userId = req.user._id;

  if (!searchTerm) {
    throw new ApiError(400, 'Search term is required');
  }

  const chats = await Chat.searchChats(userId, searchTerm);

  res.json({
    success: true,
    count: chats.length,
    data: chats
  });
});

module.exports = exports;
