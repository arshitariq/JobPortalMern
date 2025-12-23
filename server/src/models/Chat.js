const mongoose = require("mongoose");
const { Schema } = mongoose;

const participantSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: Date,
    notificationMuted: {
      type: Boolean,
      default: false
    },
    mutedUntil: Date,
    nickname: String, // Custom name in group
    permissions: {
      canSendMessages: { type: Boolean, default: true },
      canSendMedia: { type: Boolean, default: true },
      canAddMembers: { type: Boolean, default: false },
      canRemoveMembers: { type: Boolean, default: false },
      canEditInfo: { type: Boolean, default: false }
    }
  },
  { _id: false }
);

const chatSchema = new Schema(
  {
    // Chat Type
    type: {
      type: String,
      enum: ['private', 'group', 'channel'],
      default: 'private',
      required: true,
      index: true
    },

    // Participants
    participants: {
      type: [participantSchema],
      required: true,
      validate: {
        validator: function(v) {
          if (this.type === 'private') return v.length === 2;
          if (this.type === 'group') return v.length >= 2;
          return true;
        },
        message: 'Invalid number of participants for chat type'
      }
    },

    // Group/Channel Info
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Chat name cannot exceed 100 characters"]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    avatar: {
      url: String,
      cloudinaryId: String
    },

    // Created by (for groups/channels)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },

    // Admins (for groups)
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],

    // Last Message Info
    lastMessage: {
      content: String,
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'file', 'voice', 'location', 'contact', 'call']
      },
      createdAt: Date
    },

    // Message Count
    messageCount: {
      type: Number,
      default: 0
    },

    // Unread Counts per User
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    },

    // Settings
    settings: {
      onlyAdminsCanMessage: { type: Boolean, default: false },
      onlyAdminsCanAddMembers: { type: Boolean, default: false },
      onlyAdminsCanEditInfo: { type: Boolean, default: false },
      disappearingMessages: {
        enabled: { type: Boolean, default: false },
        duration: Number // in seconds
      },
      messageApproval: { type: Boolean, default: false } // For channels
    },

    // Privacy
    isPrivate: {
      type: Boolean,
      default: true
    },

    inviteLink: {
      type: String
    },

    // Status
    isActive: {
      type: Boolean,
      default: true
    },

    isArchived: {
      type: Boolean,
      default: false
    },

    archivedBy: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      archivedAt: { type: Date, default: Date.now }
    }],

    isPinned: {
      type: Boolean,
      default: false
    },

    pinnedBy: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      pinnedAt: { type: Date, default: Date.now }
    }],

    // Blocked Users
    blockedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],

    // Metadata
    metadata: {
      platform: String,
      source: String // 'web', 'mobile', 'desktop'
    },

    // Deletion
    deletedFor: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],

    deletedAt: Date
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1, isActive: 1 });
chatSchema.index({ 'lastMessage.createdAt': -1 });
chatSchema.index({ createdBy: 1 });
chatSchema.index({ inviteLink: 1 }, { unique: true, sparse: true });

// Compound indexes
chatSchema.index({ 
  'participants.user': 1, 
  type: 1, 
  isActive: 1 
});

// Virtual for getting other participant in private chat
chatSchema.virtual('otherParticipant').get(function() {
  if (this.type !== 'private') return null;
  // This should be populated with actual user ID in use
  return null;
});

// Methods

// Get unread count for a specific user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCounts.get(userId.toString()) || 0;
};

// Update unread count for a user
chatSchema.methods.updateUnreadCount = function(userId, increment = true) {
  const userIdStr = userId.toString();
  const currentCount = this.unreadCounts.get(userIdStr) || 0;
  
  if (increment) {
    this.unreadCounts.set(userIdStr, currentCount + 1);
  } else {
    this.unreadCounts.set(userIdStr, 0);
  }
  
  return this.save();
};

// Mark as read for user
chatSchema.methods.markAsRead = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastReadAt = new Date();
    this.unreadCounts.set(userId.toString(), 0);
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Update last message
chatSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = {
    content: message.content || this.getMessagePreview(message),
    sender: message.sender,
    type: message.type,
    createdAt: message.createdAt
  };
  
  this.messageCount += 1;
  
  // Increment unread count for all participants except sender
  this.participants.forEach(participant => {
    if (participant.user.toString() !== message.sender.toString()) {
      const userId = participant.user.toString();
      const currentCount = this.unreadCounts.get(userId) || 0;
      this.unreadCounts.set(userId, currentCount + 1);
    }
  });
  
  return this.save();
};

// Get message preview based on type
chatSchema.methods.getMessagePreview = function(message) {
  switch(message.type) {
    case 'image':
      return '📷 Image';
    case 'video':
      return '🎥 Video';
    case 'audio':
      return '🎵 Audio';
    case 'file':
      return '📎 File';
    case 'voice':
      return '🎤 Voice message';
    case 'location':
      return '📍 Location';
    case 'contact':
      return '👤 Contact';
    case 'call':
      return message.callInfo?.type === 'video' ? '📹 Video call' : '📞 Voice call';
    default:
      return message.content || 'Message';
  }
};

// Add participant
chatSchema.methods.addParticipant = function(userId, role = 'member') {
  const exists = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!exists) {
    this.participants.push({ user: userId, role });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  
  // Remove from admins if present
  this.admins = this.admins.filter(
    adminId => adminId.toString() !== userId.toString()
  );
  
  return this.save();
};

// Make admin
chatSchema.methods.makeAdmin = function(userId) {
  if (!this.admins.includes(userId)) {
    this.admins.push(userId);
    
    const participant = this.participants.find(
      p => p.user.toString() === userId.toString()
    );
    if (participant) {
      participant.role = 'admin';
      participant.permissions = {
        canSendMessages: true,
        canSendMedia: true,
        canAddMembers: true,
        canRemoveMembers: true,
        canEditInfo: true
      };
    }
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Remove admin
chatSchema.methods.removeAdmin = function(userId) {
  this.admins = this.admins.filter(
    adminId => adminId.toString() !== userId.toString()
  );
  
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  if (participant) {
    participant.role = 'member';
    participant.permissions = {
      canSendMessages: true,
      canSendMedia: true,
      canAddMembers: false,
      canRemoveMembers: false,
      canEditInfo: false
    };
  }
  
  return this.save();
};

// Mute notifications
chatSchema.methods.muteNotifications = function(userId, duration) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.notificationMuted = true;
    if (duration) {
      participant.mutedUntil = new Date(Date.now() + duration);
    }
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Unmute notifications
chatSchema.methods.unmuteNotifications = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.notificationMuted = false;
    participant.mutedUntil = null;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Archive/Unarchive for user
chatSchema.methods.toggleArchive = function(userId, archive = true) {
  if (archive) {
    const exists = this.archivedBy.find(
      a => a.user.toString() === userId.toString()
    );
    if (!exists) {
      this.archivedBy.push({ user: userId });
    }
  } else {
    this.archivedBy = this.archivedBy.filter(
      a => a.user.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

// Pin/Unpin for user
chatSchema.methods.togglePin = function(userId, pin = true) {
  if (pin) {
    const exists = this.pinnedBy.find(
      p => p.user.toString() === userId.toString()
    );
    if (!exists) {
      this.pinnedBy.push({ user: userId });
    }
  } else {
    this.pinnedBy = this.pinnedBy.filter(
      p => p.user.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

// Static methods

// Find or create private chat
chatSchema.statics.findOrCreatePrivateChat = async function(user1Id, user2Id) {
  let chat = await this.findOne({
    type: 'private',
    'participants.user': { $all: [user1Id, user2Id] },
    isActive: true
  }).populate('participants.user', 'name userName profileImage');
  
  if (!chat) {
    chat = await this.create({
      type: 'private',
      participants: [
        { user: user1Id },
        { user: user2Id }
      ],
      createdBy: user1Id
    });
    
    chat = await chat.populate('participants.user', 'name userName profileImage');
  }
  
  return chat;
};

// Get user chats
chatSchema.statics.getUserChats = function(userId, options = {}) {
  const { includeArchived = false, limit = 50, skip = 0 } = options;
  
  const query = {
    'participants.user': userId,
    isActive: true,
    deletedFor: { $ne: userId }
  };
  
  if (!includeArchived) {
    query['archivedBy.user'] = { $ne: userId };
  }
  
  return this.find(query)
    .populate('participants.user', 'name userName profileImage')
    .populate('lastMessage.sender', 'name userName profileImage')
    .sort({ 'lastMessage.createdAt': -1 })
    .limit(limit)
    .skip(skip);
};

// Search chats
chatSchema.statics.searchChats = function(userId, searchTerm) {
  return this.find({
    'participants.user': userId,
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  })
  .populate('participants.user', 'name userName profileImage')
  .limit(20);
};

module.exports = mongoose.model("Chat", chatSchema);
