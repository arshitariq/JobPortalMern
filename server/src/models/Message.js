const mongoose = require("mongoose");
const { Schema } = mongoose;

const reactionSchema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    emoji: { 
      type: String, 
      required: true 
    },
    reactedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { _id: false }
);

const mediaSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file', 'voice'],
      required: true
    },
    url: { 
      type: String, 
      required: true 
    },
    cloudinaryId: { 
      type: String 
    }, // For managing Cloudinary resources
    fileName: String,
    fileSize: Number,
    mimeType: String,
    thumbnail: String, // For videos
    duration: Number, // For audio/video in seconds
    width: Number, // For images/videos
    height: Number, // For images/videos
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    // Core Message Info
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true
    },
    
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Message Type
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'voice', 'location', 'contact', 'call'],
      default: 'text',
      required: true
    },

    // Content
    content: {
      type: String,
      trim: true,
      maxlength: [10000, "Message cannot exceed 10000 characters"]
    },

    // Media attachments (Cloudinary URLs)
    media: {
      type: [mediaSchema],
      default: []
    },

    // Call Information (for call messages)
    callInfo: {
      type: {
        type: String,
        enum: ['audio', 'video']
      },
      duration: Number, // in seconds
      status: {
        type: String,
        enum: ['missed', 'rejected', 'completed', 'failed']
      }
    },

    // Location Information
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },

    // Contact Information
    contact: {
      name: String,
      phone: String,
      email: String
    },

    // Reply/Forward Info
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },

    isForwarded: {
      type: Boolean,
      default: false
    },

    originalSender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },

    // Message Status
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sent',
      index: true
    },

    deliveredAt: Date,
    readAt: Date,

    // Reactions
    reactions: {
      type: [reactionSchema],
      default: []
    },

    // Deletion Status
    deletedFor: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],

    deletedForEveryone: {
      type: Boolean,
      default: false
    },

    deletedAt: Date,

    // Edit History
    isEdited: {
      type: Boolean,
      default: false
    },

    editHistory: [{
      content: String,
      editedAt: { type: Date, default: Date.now }
    }],

    // Metadata
    metadata: {
      platform: String, // web, mobile, desktop
      deviceInfo: String,
      ipAddress: String
    },

    // Encryption (for future E2E encryption)
    isEncrypted: {
      type: Boolean,
      default: false
    },

    encryptionKey: String,

    // Timestamps
    scheduledFor: Date, // For scheduled messages
    expiresAt: Date // For temporary messages
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ deletedForEveryone: 1, deletedFor: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for checking if message is deleted for user
messageSchema.virtual('isDeleted').get(function() {
  return this.deletedForEveryone || this.deletedFor.length > 0;
});

// Methods
messageSchema.methods.markAsRead = function(userId) {
  if (this.receiver.toString() === userId.toString() && this.status !== 'read') {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.markAsDelivered = function() {
  if (this.status === 'sent') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString()
  );
  
  if (existingReaction) {
    existingReaction.emoji = emoji;
    existingReaction.reactedAt = new Date();
  } else {
    this.reactions.push({ user: userId, emoji });
  }
  
  return this.save();
};

messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  return this.save();
};

messageSchema.methods.deleteForUser = function(userId) {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.deleteForEveryone = function() {
  this.deletedForEveryone = true;
  this.deletedAt = new Date();
  return this.save();
};

messageSchema.methods.editMessage = function(newContent) {
  if (this.content) {
    this.editHistory.push({ content: this.content });
  }
  this.content = newContent;
  this.isEdited = true;
  return this.save();
};

// Static methods
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    status: { $in: ['sent', 'delivered'] },
    deletedForEveryone: false,
    deletedFor: { $ne: userId }
  });
};

messageSchema.statics.markChatAsRead = function(chatId, userId) {
  return this.updateMany(
    {
      chatId,
      receiver: userId,
      status: { $ne: 'read' },
      deletedForEveryone: false,
      deletedFor: { $ne: userId }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );
};

messageSchema.statics.getChatMessages = function(chatId, userId, limit = 50, skip = 0) {
  return this.find({
    chatId,
    $or: [
      { deletedForEveryone: false },
      { deletedFor: { $ne: userId } }
    ]
  })
  .populate('sender', 'name userName profileImage')
  .populate('receiver', 'name userName profileImage')
  .populate('replyTo')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

messageSchema.statics.searchMessages = function(chatId, userId, searchTerm) {
  return this.find({
    chatId,
    content: { $regex: searchTerm, $options: 'i' },
    $or: [
      { deletedForEveryone: false },
      { deletedFor: { $ne: userId } }
    ]
  })
  .populate('sender', 'name userName profileImage')
  .sort({ createdAt: -1 })
  .limit(20);
};

// Pre-save hook
messageSchema.pre('save', function() {
  // Set delivered status if status is sent and receiver is online (you need to implement online check)
  if (this.isNew && this.status === 'sent') {
    this.deliveredAt = new Date();
  }
});

module.exports = mongoose.model("Message", messageSchema);
