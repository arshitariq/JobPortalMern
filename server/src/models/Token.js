const mongoose = require("mongoose");
const { Schema } = mongoose;
const crypto = require('crypto');

const tokenSchema = new Schema(
  {
    // 🔑 TOKEN IDENTIFICATION
    tokenId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      default: () => crypto.randomBytes(16).toString('hex')
    },
    
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },
    
    userType: {
      type: String,
      enum: ["applicant", "employer", "admin"],
      required: true,
      index: true
    },
    
    // 🎯 TOKEN TYPE & PURPOSE
    type: { 
      type: String, 
      enum: [
        "email_verify", 
        "password_reset", 
        "two_factor_auth",
        "api_access",
        "session_refresh",
        "device_verification",
        "email_change",
        "phone_verify",
        "account_recovery",
        "invitation",
        "oauth_authorization",
        "payment_verification",
        "data_export",
        "account_deletion"
      ], 
      required: true,
      index: true
    },
    
    subType: {
      type: String,
      enum: [
        "primary_email",
        "secondary_email",
        "sms",
        "authenticator",
        "backup_code",
        "emergency"
      ]
    },
    
    // 🔐 TOKEN SECURITY
    tokenHash: { 
      type: String, 
      required: true, 
      index: true 
    },
    
    tokenSalt: {
      type: String,
      select: false
    },
    
    plainToken: {
      type: String,
      select: false,
      default: null
    },
    
    jti: { // JWT ID for revocation tracking
      type: String,
      index: true,
      sparse: true
    },
    
    // ⏰ TIMING & VALIDITY
    issuedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    
    expiresAt: { 
      type: Date, 
      required: true
    },
    
    usedAt: {
      type: Date,
      default: null,
      index: true
    },
    
    validFrom: {
      type: Date,
      default: Date.now
    },
    
    // 🔄 USAGE TRACKING
    usageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    maxUsage: {
      type: Number,
      default: 1
    },
    
    lastUsedAt: Date,
    
    usedFromIp: String,
    
    usedUserAgent: String,
    
    usageHistory: [{
      usedAt: Date,
      ip: String,
      userAgent: String,
      location: String,
      metadata: Schema.Types.Mixed
    }],
    
    // 🎯 SCOPE & PERMISSIONS
    scope: [{
      type: String,
      enum: [
        'read:profile',
        'write:profile',
        'read:jobs',
        'write:jobs',
        'read:applications',
        'write:applications',
        'read:messages',
        'write:messages',
        'admin:users',
        'admin:jobs',
        'admin:settings'
      ]
    }],
    
    permissions: {
      type: Map,
      of: Boolean
    },
    
    // 📍 DEVICE & LOCATION
    issuedFromIp: {
      type: String,
      required: true,
      maxlength: 45
    },
    
    ipDetails: {
      country: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      proxy: Boolean,
      vpn: Boolean
    },
    
    issuedUserAgent: {
      type: String,
      required: true
    },
    
    deviceFingerprint: String,
    
    location: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      accuracy: Number
    },
    
    // 🔗 ASSOCIATED DATA
    associatedData: {
      type: Map,
      of: Schema.Types.Mixed
    },
    
    metadata: {
      email: String,
      phone: String,
      newValue: String, // For email/phone change tokens
      oldValue: String,
      redirectUrl: String,
      callbackUrl: String,
      clientId: String, // For OAuth
      state: String, // For OAuth state parameter
      challenge: String // For 2FA challenges
    },
    
    // ⚠️ SECURITY FLAGS
    security: {
      isCompromised: {
        type: Boolean,
        default: false
      },
      compromisedAt: Date,
      compromiseReason: {
        type: String,
        enum: ['multiple_attempts', 'unusual_location', 'suspicious_activity', 'admin_revoked']
      },
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      suspiciousActivities: [String]
    },
    
    // 🛡️ VALIDATION & VERIFICATION
    validation: {
      requiresMfa: {
        type: Boolean,
        default: false
      },
      mfaVerified: {
        type: Boolean,
        default: false
      },
      requiresRecaptcha: {
        type: Boolean,
        default: false
      },
      captchaVerified: {
        type: Boolean,
        default: false
      },
      requiresEmailConfirmation: {
        type: Boolean,
        default: false
      },
      emailConfirmed: {
        type: Boolean,
        default: false
      }
    },
    
    // 🔄 TOKEN CHAINING
    parentTokenId: {
      type: String,
      ref: "Token"
    },
    
    childTokens: [{
      tokenId: String,
      type: String,
      createdAt: Date
    }],
    
    tokenChain: [{
      tokenId: String,
      type: String,
      issuedAt: Date,
      expiresAt: Date
    }],
    
    // 📊 ANALYTICS
    analytics: {
      requestCount: { type: Number, default: 0 },
      lastRequest: Date,
      averageResponseTime: Number,
      errorCount: { type: Number, default: 0 },
      errors: [{
        error: String,
        occurredAt: Date,
        stackTrace: String
      }]
    },
    
    // ⚙️ TOKEN PROPERTIES
    properties: {
      isRevocable: { type: Boolean, default: true },
      isSingleUse: { type: Boolean, default: true },
      isRenewable: { type: Boolean, default: false },
      autoRefresh: { type: Boolean, default: false },
      refreshTokenId: String,
      rotationPolicy: {
        type: String,
        enum: ['none', 'time_based', 'usage_based', 'both'],
        default: 'none'
      }
    },
    
    // 🔄 ROTATION & REFRESH
    rotationHistory: [{
      rotatedAt: Date,
      previousTokenId: String,
      newTokenId: String,
      reason: String
    }],
    
    refreshCount: { type: Number, default: 0 },
    
    lastRefreshedAt: Date,
    
    // 🎯 CUSTOM VALIDATION RULES
    validationRules: {
      allowedIps: [String],
      blockedIps: [String],
      allowedUserAgents: [String],
      allowedCountries: [String],
      blockedCountries: [String],
      timeWindow: {
        start: String, // "09:00"
        end: String,   // "17:00"
        timezone: String
      },
      maxRequestsPerMinute: Number
    },
    
    // 📝 AUDIT TRAIL
    auditLog: [{
      action: String,
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      ipAddress: String,
      userAgent: String
    }],
    
    // 🚀 PERFORMANCE
    performance: {
      generationTime: Number, // milliseconds
      validationTime: Number,
      size: Number // bytes
    },
    
    // 🏷️ TAGS & CATEGORIES
    tags: [String],
    
    category: {
      type: String,
      enum: ['authentication', 'authorization', 'verification', 'recovery', 'invitation', 'system'],
      default: 'verification'
    },
    
    // 📈 PRIORITY & IMPORTANCE
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    
    // 🔧 INTEGRATION
    integration: {
      clientId: String,
      clientName: String,
      apiVersion: String,
      platform: String // web, mobile, api
    },
    
    // 📱 MOBILE SPECIFIC
    mobile: {
      deviceId: String,
      pushToken: String,
      appVersion: String
    },
    
    // ⚠️ STATUS
    status: {
      type: String,
      enum: ['active', 'used', 'expired', 'revoked', 'compromised', 'invalidated'],
      default: 'active',
      index: true
    },
    
    revokedAt: Date,
    
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    revocationReason: {
      type: String,
      enum: ['user_request', 'security_breach', 'password_change', 'admin_action', 'suspicious_activity', 'token_rotation']
    },
    
    // 🧹 CLEANUP
    cleanup: {
      scheduled: { type: Boolean, default: false },
      cleanedAt: Date,
      retentionDays: { type: Number, default: 30 }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.tokenHash;
        delete ret.tokenSalt;
        delete ret.plainToken;
        delete ret.deviceFingerprint;
        delete ret.security;
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

// 🔍 COMPOUND INDEXES
tokenSchema.index({ userId: 1, type: 1, status: 1 });
tokenSchema.index({ tokenHash: 1, status: 1 });
tokenSchema.index({ expiresAt: 1, status: 1 });
tokenSchema.index({ issuedAt: -1, type: 1 });
tokenSchema.index({ 'metadata.email': 1, type: 1 });
tokenSchema.index({ 'integration.clientId': 1, status: 1 });
tokenSchema.index({ 'validationRules.allowedIps': 1 });
tokenSchema.index({ status: 1, cleanup: 1 });

// ⏰ TTL INDEXES
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ 'cleanup.scheduled': 1, 'cleanup.cleanedAt': 1 });

// 🎯 VIRTUAL FIELDS
tokenSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

tokenSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.validFrom && 
         now <= this.expiresAt &&
         this.usageCount < this.maxUsage &&
         !this.security?.isCompromised;
});

tokenSchema.virtual('isUsed').get(function() {
  return this.usedAt !== null || this.usageCount >= this.maxUsage;
});

tokenSchema.virtual('remainingUses').get(function() {
  return Math.max(0, this.maxUsage - this.usageCount);
});

tokenSchema.virtual('timeToExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiresAt);
  return Math.max(0, expiry - now); // milliseconds
});

tokenSchema.virtual('age').get(function() {
  const now = new Date();
  const issued = new Date(this.issuedAt);
  return now - issued; // milliseconds
});

tokenSchema.virtual('locationString').get(function() {
  if (!this.ipDetails) return 'Unknown';
  const { city, region, country } = this.ipDetails;
  return [city, region, country].filter(Boolean).join(', ');
});

// ⚡ PRE-SAVE HOOKS
tokenSchema.pre('save', function() {
  // Auto-set status based on conditions
  if (this.isExpired && this.status === 'active') {
    this.status = 'expired';
  }
  
  if (this.usageCount >= this.maxUsage && this.status === 'active') {
    this.status = 'used';
    this.usedAt = this.usedAt || new Date();
  }
  
  // Calculate risk score based on suspicious activities
  if (this.security?.suspiciousActivities?.length > 0) {
    const riskFactors = {
      'multiple_locations': 30,
      'unusual_time': 20,
      'multiple_attempts': 25,
      'suspicious_ip': 35
    };
    
    let score = 0;
    this.security.suspiciousActivities.forEach(activity => {
      score += riskFactors[activity] || 15;
    });
    
    this.security.riskScore = Math.min(100, score);
    
    // Auto-mark as compromised if score > 70
    if (score > 70 && !this.security.isCompromised) {
      this.security.isCompromised = true;
      this.security.compromisedAt = new Date();
      this.status = 'compromised';
    }
  }
  
  // Set default expiration based on token type
  if (!this.expiresAt) {
    const expiryTimes = {
      'email_verify': 24 * 60 * 60 * 1000, // 24 hours
      'password_reset': 1 * 60 * 60 * 1000, // 1 hour
      'two_factor_auth': 10 * 60 * 1000, // 10 minutes
      'api_access': 30 * 24 * 60 * 60 * 1000, // 30 days
      'session_refresh': 7 * 24 * 60 * 60 * 1000, // 7 days
      'device_verification': 30 * 60 * 1000, // 30 minutes
      'email_change': 1 * 60 * 60 * 1000, // 1 hour
      'phone_verify': 10 * 60 * 1000, // 10 minutes
      'account_recovery': 24 * 60 * 60 * 1000, // 24 hours
      'invitation': 7 * 24 * 60 * 60 * 1000, // 7 days
      'oauth_authorization': 10 * 60 * 1000, // 10 minutes
      'payment_verification': 15 * 60 * 1000, // 15 minutes
      'data_export': 1 * 60 * 60 * 1000, // 1 hour
      'account_deletion': 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    
    const defaultExpiry = expiryTimes[this.type] || 1 * 60 * 60 * 1000; // Default 1 hour
    this.expiresAt = new Date(Date.now() + defaultExpiry);
  }
  
  // Set category based on type
  if (!this.category) {
    const typeCategories = {
      'email_verify': 'verification',
      'password_reset': 'recovery',
      'two_factor_auth': 'authentication',
      'api_access': 'authorization',
      'session_refresh': 'authentication',
      'device_verification': 'verification',
      'email_change': 'verification',
      'phone_verify': 'verification',
      'account_recovery': 'recovery',
      'invitation': 'invitation',
      'oauth_authorization': 'authorization',
      'payment_verification': 'verification',
      'data_export': 'system',
      'account_deletion': 'system'
    };
    
    this.category = typeCategories[this.type] || 'verification';
  }
  
  // Generate JTI if not present (for JWT tokens)
  if (!this.jti && (this.type === 'api_access' || this.type === 'session_refresh')) {
    this.jti = crypto.randomBytes(16).toString('hex');
  }
});

// 🎯 STATIC METHODS
tokenSchema.statics.generateToken = async function(userId, type, metadata = {}) {
  const Token = mongoose.model('Token');
  
  // Generate random token
  const plainToken = crypto.randomBytes(32).toString('hex');
  const tokenSalt = crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(plainToken + tokenSalt)
    .digest('hex');
  
  // Create token document
  const token = new Token({
    userId,
    type,
    tokenHash,
    tokenSalt,
    plainToken,
    issuedFromIp: metadata.ip || '0.0.0.0',
    issuedUserAgent: metadata.userAgent || 'Unknown',
    ipDetails: metadata.ipDetails || {},
    metadata: metadata.data || {},
    userType: metadata.userType || 'applicant',
    scope: metadata.scope || [],
    permissions: metadata.permissions || {},
    maxUsage: metadata.maxUsage || 1,
    validationRules: metadata.validationRules || {}
  });
  
  await token.save();
  
  // Return plain token for sending to user
  return {
    token: plainToken,
    tokenId: token.tokenId,
    expiresAt: token.expiresAt,
    type: token.type
  };
};

tokenSchema.statics.validateToken = async function(tokenId, plainToken, metadata = {}) {
  const Token = mongoose.model('Token');
  
  // Find token
  const token = await Token.findOne({
    tokenId,
    status: 'active'
  }).select('+tokenSalt +plainToken');
  
  if (!token) {
    throw new Error('Token not found or invalid');
  }
  
  // Check if expired
  if (token.isExpired) {
    token.status = 'expired';
    await token.save();
    throw new Error('Token has expired');
  }
  
  // Check if already used
  if (token.isUsed) {
    throw new Error('Token has already been used');
  }
  
  // Check if compromised
  if (token.security?.isCompromised) {
    throw new Error('Token has been compromised');
  }
  
  // Validate token hash
  const testHash = crypto
    .createHash('sha256')
    .update(plainToken + token.tokenSalt)
    .digest('hex');
  
  if (testHash !== token.tokenHash) {
    // Track failed attempt
    token.security.suspiciousActivities = token.security.suspiciousActivities || [];
    token.security.suspiciousActivities.push('multiple_attempts');
    await token.save();
    
    throw new Error('Invalid token');
  }
  
  // Validate IP restrictions if any
  if (token.validationRules?.allowedIps?.length > 0) {
    const clientIp = metadata.ip;
    if (!token.validationRules.allowedIps.includes(clientIp)) {
      throw new Error('Access from this IP is not allowed');
    }
  }
  
  // Validate country restrictions if any
  if (token.validationRules?.allowedCountries?.length > 0 && metadata.ipDetails?.country) {
    if (!token.validationRules.allowedCountries.includes(metadata.ipDetails.country)) {
      throw new Error('Access from this country is not allowed');
    }
  }
  
  // Validate time window if any
  if (token.validationRules?.timeWindow) {
    const now = new Date();
    const [startHour, startMinute] = token.validationRules.timeWindow.start.split(':').map(Number);
    const [endHour, endMinute] = token.validationRules.timeWindow.end.split(':').map(Number);
    
    const startTime = new Date(now);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    if (now < startTime || now > endTime) {
      throw new Error('Token is not valid at this time');
    }
  }
  
  // Update usage
  token.usageCount += 1;
  token.lastUsedAt = new Date();
  token.usedFromIp = metadata.ip;
  token.usedUserAgent = metadata.userAgent;
  
  // Add to usage history
  token.usageHistory = token.usageHistory || [];
  token.usageHistory.push({
    usedAt: new Date(),
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    location: metadata.ipDetails?.city ? `${metadata.ipDetails.city}, ${metadata.ipDetails.country}` : 'Unknown',
    metadata: metadata.usageMetadata || {}
  });
  
  // Keep only last 10 usage records
  if (token.usageHistory.length > 10) {
    token.usageHistory = token.usageHistory.slice(-10);
  }
  
  // Mark as used if max usage reached
  if (token.usageCount >= token.maxUsage) {
    token.usedAt = new Date();
    token.status = 'used';
  }
  
  await token.save();
  
  return {
    valid: true,
    token,
    userId: token.userId,
    type: token.type,
    metadata: token.metadata,
    scope: token.scope
  };
};

tokenSchema.statics.revokeToken = async function(tokenId, revokedBy = null, reason = 'admin_action') {
  const Token = mongoose.model('Token');
  
  const token = await Token.findOneAndUpdate(
    { tokenId, status: 'active' },
    {
      $set: {
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: revokedBy,
        revocationReason: reason
      }
    },
    { new: true }
  );
  
  return token;
};

tokenSchema.statics.revokeAllUserTokens = async function(userId, tokenType = null, reason = 'password_change') {
  const Token = mongoose.model('Token');
  
  const query = { 
    userId, 
    status: 'active',
    type: { $ne: 'api_access' } // Don't revoke API tokens automatically
  };
  
  if (tokenType) {
    query.type = tokenType;
  }
  
  const result = await Token.updateMany(
    query,
    {
      $set: {
        status: 'revoked',
        revokedAt: new Date(),
        revocationReason: reason
      }
    }
  );
  
  return result.modifiedCount;
};

tokenSchema.statics.cleanupExpiredTokens = async function() {
  const Token = mongoose.model('Token');
  
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  const result = await Token.updateMany(
    {
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: { $in: ['expired', 'used', 'revoked', 'compromised'] } },
        { issuedAt: { $lt: cutoffDate } }
      ],
      'cleanup.scheduled': { $ne: true }
    },
    {
      $set: {
        'cleanup.scheduled': true,
        status: 'expired'
      }
    }
  );
  
  return result.modifiedCount;
};

tokenSchema.statics.getTokenStats = async function(userId = null) {
  const Token = mongoose.model('Token');
  
  const matchStage = {};
  if (userId) {
    matchStage.userId = mongoose.Types.ObjectId(userId);
  }
  
  const stats = await Token.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'active'] },
                  { $gt: ['$expiresAt', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        used: {
          $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] }
        },
        expired: {
          $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
        },
        avgLifetime: {
          $avg: { $subtract: ['$expiresAt', '$issuedAt'] }
        }
      }
    },
    {
      $project: {
        type: '$_id',
        total: 1,
        active: 1,
        used: 1,
        expired: 1,
        avgLifetime: { $divide: ['$avgLifetime', 1000 * 60 * 60] } // Convert to hours
      }
    },
    { $sort: { total: -1 } }
  ]);
  
  const totalTokens = await Token.countDocuments(matchStage);
  const activeTokens = await Token.countDocuments({
    ...matchStage,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
  
  return {
    totalTokens,
    activeTokens,
    byType: stats,
    activeRate: totalTokens > 0 ? (activeTokens / totalTokens) * 100 : 0
  };
};

// ⚙️ INSTANCE METHODS
tokenSchema.methods.isValidForIp = function(ip) {
  if (!this.validationRules?.allowedIps || this.validationRules.allowedIps.length === 0) {
    return true;
  }
  
  return this.validationRules.allowedIps.includes(ip);
};

tokenSchema.methods.isValidForCountry = function(countryCode) {
  if (!this.validationRules?.allowedCountries || this.validationRules.allowedCountries.length === 0) {
    return true;
  }
  
  return this.validationRules.allowedCountries.includes(countryCode);
};

tokenSchema.methods.isValidForTime = function() {
  if (!this.validationRules?.timeWindow) {
    return true;
  }
  
  const now = new Date();
  const [startHour, startMinute] = this.validationRules.timeWindow.start.split(':').map(Number);
  const [endHour, endMinute] = this.validationRules.timeWindow.end.split(':').map(Number);
  
  const startTime = new Date(now);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(now);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  return now >= startTime && now <= endTime;
};

tokenSchema.methods.refresh = async function(newExpiry = null) {
  if (!this.properties.isRenewable) {
    throw new Error('This token cannot be refreshed');
  }
  
  const newExpiresAt = newExpiry || new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  this.expiresAt = newExpiresAt;
  this.refreshCount += 1;
  this.lastRefreshedAt = new Date();
  
  // Add to rotation history
  this.rotationHistory.push({
    rotatedAt: new Date(),
    previousTokenId: this.tokenId,
    newTokenId: crypto.randomBytes(16).toString('hex'),
    reason: 'manual_refresh'
  });
  
  return this.save();
};

tokenSchema.methods.markAsCompromised = function(reason = 'suspicious_activity') {
  this.security.isCompromised = true;
  this.security.compromisedAt = new Date();
  this.security.compromiseReason = reason;
  this.status = 'compromised';
  
  return this.save();
};

tokenSchema.methods.getUsageAnalytics = function() {
  const totalUses = this.usageHistory.length;
  const uniqueIps = new Set(this.usageHistory.map(u => u.ip)).size;
  const uniqueLocations = new Set(
    this.usageHistory
      .map(u => u.location)
      .filter(l => l !== 'Unknown')
  ).size;
  
  const firstUse = this.usageHistory[0]?.usedAt || this.issuedAt;
  const lastUse = this.usageHistory[this.usageHistory.length - 1]?.usedAt || this.issuedAt;
  
  return {
    totalUses,
    uniqueIps,
    uniqueLocations,
    firstUse,
    lastUse,
    usageFrequency: totalUses / Math.max(1, (lastUse - firstUse) / (1000 * 60 * 60 * 24)) // uses per day
  };
};

// 🎨 QUERY HELPERS
tokenSchema.query.active = function() {
  return this.where({ 
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

tokenSchema.query.byType = function(type) {
  return this.where({ type });
};

tokenSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

tokenSchema.query.expired = function() {
  return this.where({ 
    $or: [
      { status: 'expired' },
      { expiresAt: { $lt: new Date() } }
    ]
  });
};

tokenSchema.query.recent = function(hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.where({ issuedAt: { $gte: cutoff } });
};

// 📊 AGGREGATION PIPELINES
tokenSchema.statics.getSecurityReport = async function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        issuedAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        totalTokens: { $sum: 1 },
        compromisedTokens: {
          $sum: { $cond: [{ $eq: ['$security.isCompromised', true] }, 1, 0] }
        },
        suspiciousTokens: {
          $sum: {
            $cond: [
              { $gt: ['$security.riskScore', 50] },
              1,
              0
            ]
          }
        },
        failedValidations: {
          $sum: {
            $cond: [
              { $gt: ['$analytics.errorCount', 0] },
              1,
              0
            ]
          }
        },
        avgRiskScore: { $avg: '$security.riskScore' },
        tokenTypes: { $addToSet: '$type' }
      }
    },
    {
      $project: {
        totalTokens: 1,
        compromisedTokens: 1,
        suspiciousTokens: 1,
        failedValidations: 1,
        avgRiskScore: { $round: ['$avgRiskScore', 2] },
        compromiseRate: {
          $cond: [
            { $eq: ['$totalTokens', 0] },
            0,
            { $multiply: [{ $divide: ['$compromisedTokens', '$totalTokens'] }, 100] }
          ]
        },
        tokenTypes: { $size: '$tokenTypes' }
      }
    }
  ]);
};

module.exports = mongoose.model("Token", tokenSchema);
