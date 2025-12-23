const mongoose = require("mongoose");
const { Schema } = mongoose;

const socialLinkSchema = new Schema(
  {
    platform: { 
      type: String, 
      enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github', 'glassdoor', 'other'],
      required: true,
      lowercase: true,
      trim: true,
    },
    url: { type: String, trim: true, default: "" },
    isPublic: { type: Boolean, default: true }
  },
  { _id: false }
);

const benefitSchema = new Schema(
  {
    category: {
      type: String,
      enum: ['health', 'financial', 'wellness', 'professional', 'time-off', 'equipment', 'other']
    },
    name: { type: String, required: true },
    description: String,
    icon: String
  },
  { _id: false }
);

const leadershipSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    photo: String,
    bio: String,
    linkedinUrl: String,
    twitterUrl: String,
    isFounder: { type: Boolean, default: false }
  },
  { _id: false }
);

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    content: String,
    pros: [String],
    cons: [String],
    isCurrentEmployee: Boolean,
    employmentStatus: { type: String, enum: ['current', 'former'], default: 'current' },
    jobTitle: String,
    department: String,
    location: String,
    helpfulCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const employerSchema = new Schema(
  {
    // Basic Info
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Company Identity
    companyName: {
      type: String,
      maxlength: [255, "Company name cannot exceed 255 characters"],
      trim: true,
      index: true,
      default: "",
    },
    tagline: {
      type: String,
      maxlength: [200, "Tagline cannot exceed 200 characters"],
      trim: true
    },
    description: {
      type: String,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
      trim: true,
    },
    avatarUrl: { 
      type: String, 
      default: "" 
    },
    bannerImageUrl: { 
      type: String, 
      default: "" 
    },

    // Company Details
    organizationType: {
      type: String,
      maxlength: [100, "Organization type cannot exceed 100 characters"],
      trim: true,
      lowercase: true,
      default: "",
    },
    industry: {
      type: String,
      maxlength: [100, "Industry cannot exceed 100 characters"],
      trim: true,
      index: true,
      default: "",
    },
    subIndustry: [String],
    
    teamSize: {
      type: String,
      maxlength: [50, "Team size label cannot exceed 50 characters"],
      trim: true,
      default: "",
    },
    
    yearOfEstablishment: {
      type: Number,
      min: [1800, "Year must be after 1800"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    
    // Contact & Location
    headquarters: {
      address: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
      }
    },
    
    additionalLocations: [{
      address: String,
      city: String,
      state: String,
      country: String,
      type: { type: String, enum: ['office', 'remote', 'branch'] }
    }],
    
    websiteUrl: {
      type: String,
      maxlength: [255, "Website URL cannot exceed 255 characters"],
      trim: true,
      default: "",
      validate: {
        validator: function(v) {
          return v === '' || /^https?:\/\/.+\..+/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    
    contactEmail: {
      type: String,
      maxlength: [255, "Email cannot exceed 255 characters"],
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    
    phone: {
      type: String,
      maxlength: [50, "Phone cannot exceed 50 characters"],
      trim: true,
      default: "",
    },
    
    location: {
      type: String,
      maxlength: [255, "Location cannot exceed 255 characters"],
      trim: true,
      default: "",
    },
    
    mapLocation: {
      type: String,
      trim: true,
      default: "",
    },
    
    // Company Culture & Vision
    companyVision: {
      type: String,
      maxlength: [5000, "Company vision cannot exceed 5000 characters"],
      trim: true,
      default: "",
    },
    
    missionStatement: {
      type: String,
      maxlength: [1000, "Mission statement cannot exceed 1000 characters"],
      trim: true,
      default: "",
    },
    
    coreValues: [{
      title: String,
      description: String,
      icon: String
    }],
    
    culture: {
      workEnvironment: {
        type: String,
        enum: ['formal', 'casual', 'startup', 'corporate', 'remote-first', 'hybrid']
      },
      dressCode: String,
      workHours: String,
      meetingCulture: String,
      feedbackStyle: String
    },
    
    // Social & Media
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
    
    media: {
      logoVariants: {
        primary: String,
        secondary: String,
        favicon: String,
        whiteLogo: String
      },
      photos: [{
        url: String,
        caption: String,
        category: String,
        uploadedAt: { type: Date, default: Date.now }
      }],
      videos: [{
        url: String,
        title: String,
        description: String,
        thumbnail: String
      }]
    },
    
    // Benefits & Perks
    benefits: {
      type: [benefitSchema],
      default: []
    },
    
    perks: [String],
    
    // Leadership & Team
    leadership: {
      type: [leadershipSchema],
      default: []
    },
    
    keyHires: [{
      name: String,
      title: String,
      joinedDate: Date,
      formerCompany: String,
      announcementUrl: String
    }],
    
    departments: [String],
    
    // Reviews & Ratings
    reviews: {
      type: [reviewSchema],
      default: []
    },
    
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: function(v) {
        return parseFloat(v.toFixed(1));
      }
    },
    
    reviewCount: { type: Number, default: 0 },
    
    // Verification & Status
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    
    verifiedAt: Date,
    
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    // Metrics & Analytics
    metrics: {
      totalJobsPosted: { type: Number, default: 0 },
      activeJobs: { type: Number, default: 0 },
      totalHires: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
      profileViewers: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now }
      }],
      followersCount: { type: Number, default: 0 },
      monthlyApplications: { type: Number, default: 0 }
    },
    
    // SEO & Discovery
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    
    keywords: [String],
    
    searchTags: [String],
    
    // Subscription & Premium
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free'
      },
      features: [String],
      startedAt: Date,
      expiresAt: Date,
      autoRenew: { type: Boolean, default: false },
      paymentMethod: String
    },
    
    premiumFeatures: {
      featuredJobs: { type: Number, default: 0 },
      candidateSearchCredits: { type: Number, default: 0 },
      advancedAnalytics: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      brandingCustomization: { type: Boolean, default: false }
    },
    
    // Settings & Preferences
    settings: {
      emailNotifications: {
        newApplication: { type: Boolean, default: true },
        jobAlert: { type: Boolean, default: true },
        candidateMessage: { type: Boolean, default: true },
        reviewNotification: { type: Boolean, default: true }
      },
      privacy: {
        showSalary: { type: Boolean, default: true },
        showTeamSize: { type: Boolean, default: true },
        showRevenue: { type: Boolean, default: false },
        showExactLocation: { type: Boolean, default: true }
      },
      applicationSettings: {
        autoReply: { type: Boolean, default: false },
        replyTemplate: String,
        requireCoverLetter: { type: Boolean, default: false },
        applicationDeadline: Number // days
      }
    },
    
    // Timeline
    milestones: [{
      year: Number,
      title: String,
      description: String,
      icon: String
    }],
    
    awards: [{
      name: String,
      issuer: String,
      year: Number,
      category: String,
      description: String,
      imageUrl: String
    }],
    
    partnerships: [{
      company: String,
      type: String,
      description: String,
      logo: String
    }],
    
    // Soft Delete
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
employerSchema.index({ companyName: 'text', industry: 'text', description: 'text' });
employerSchema.index({ 'headquarters.country': 1, 'headquarters.city': 1 });
employerSchema.index({ verificationStatus: 1, isActive: 1 });
employerSchema.index({ averageRating: -1, reviewCount: -1 });
employerSchema.index({ 'headquarters.coordinates': '2dsphere' });

// Virtual for full company name
employerSchema.virtual('fullName').get(function() {
  return `${this.companyName}${this.tagline ? ` - ${this.tagline}` : ''}`;
});

// Pre-save hook for slug generation
employerSchema.pre('save', function() {
  if (this.companyName && !this.slug) {
    this.slug = this.companyName
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }
});

// Method to calculate average rating
employerSchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
    return;
  }
  
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = parseFloat((total / this.reviews.length).toFixed(1));
  this.reviewCount = this.reviews.length;
};

module.exports = mongoose.model("Employer", employerSchema);
