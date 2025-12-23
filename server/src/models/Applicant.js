const mongoose = require("mongoose");
const { Schema } = mongoose;

const socialLinkSchema = new Schema(
  {
    platform: { 
      type: String, 
      enum: ['linkedin', 'twitter', 'github', 'behance', 'dribbble', 'medium', 'website', 'other'],
      required: true 
    },
    url: { type: String, trim: true, required: true },
    isPublic: { type: Boolean, default: true }
  },
  { _id: false }
);

const workExperienceSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'self-employed'],
      default: 'full-time'
    },
    industry: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    achievements: [String],
    skills: [String],
    media: [{
      type: { type: String, enum: ['image', 'document', 'link', 'video'] },
      url: String,
      caption: String
    }],
    references: [{
      name: String,
      contact: String,
      relationship: String,
      email: String,
      phone: String
    }]
  },
  { timestamps: true }
);

const educationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: String,
    grade: String,
    gpa: Number,
    scale: Number,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    activities: [String],
    honors: [String],
    skills: [String],
    media: [{
      type: { type: String, enum: ['image', 'document', 'certificate'] },
      url: String,
      caption: String
    }]
  },
  { timestamps: true }
);

const skillSchema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'tool', 'framework', 'methodology', 'domain'],
      default: 'technical'
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: Number,
    lastUsed: Date,
    endorsements: [{
      endorser: { type: Schema.Types.ObjectId, ref: 'User' },
      endorsedAt: { type: Date, default: Date.now },
      relationship: String,
      message: String
    }],
    endorsementCount: { type: Number, default: 0 }
  },
  { _id: false }
);

const languageSchema = new Schema(
  {
    language: { type: String, required: true },
    proficiency: {
      type: String,
      enum: ['elementary', 'intermediate', 'professional', 'native', 'bilingual'],
      default: 'professional'
    },
    reading: { type: Number, min: 1, max: 5, default: 3 },
    writing: { type: Number, min: 1, max: 5, default: 3 },
    speaking: { type: Number, min: 1, max: 5, default: 3 },
    certification: {
      name: String,
      level: String,
      score: String,
      date: Date
    }
  },
  { _id: false }
);

const certificationSchema = new Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    skills: [String],
    verification: {
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: String
    },
    media: {
      certificateUrl: String,
      badgeUrl: String
    }
  },
  { timestamps: true }
);

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    role: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    url: String,
    githubUrl: String,
    demoUrl: String,
    teamSize: Number,
    achievements: [String],
    media: [{
      type: { type: String, enum: ['image', 'video', 'link', 'document'] },
      url: String,
      caption: String
    }]
  },
  { timestamps: true }
);

const applicantSchema = new Schema(
  {
    // Basic Info
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal Information
    personalInfo: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      headline: {
        type: String,
        maxlength: [255, "Headline cannot exceed 255 characters"],
        trim: true
      },
      avatarUrl: { type: String },
      bannerUrl: { type: String },
      dateOfBirth: Date,
      nationality: { type: String, trim: true },
      gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'prefer-not-to-say', 'other']
      },
      maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed', 'separated']
      },
      pronouns: String
    },

    // Contact Information
    contactInfo: {
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        coordinates: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], default: [0, 0] }
        }
      },
      preferredContact: {
        type: String,
        enum: ['email', 'phone', 'linkedin', 'whatsapp'],
        default: 'email'
      },
      timezone: String
    },

    // Professional Summary
    summary: {
      type: String,
      maxlength: [2000, "Summary cannot exceed 2000 characters"],
      trim: true
    },

    // Work Experience (Detailed)
    workExperience: {
      type: [workExperienceSchema],
      default: []
    },

    totalExperience: {
      years: { type: Number, default: 0 },
      months: { type: Number, default: 0 }
    },

    // Education (Detailed)
    education: {
      type: [educationSchema],
      default: []
    },

    highestEducation: {
      degree: String,
      institution: String,
      year: Number
    },

    // Skills with Endorsements
    skills: {
      type: [skillSchema],
      default: []
    },

    // Languages
    languages: {
      type: [languageSchema],
      default: []
    },

    // Certifications & Licenses
    certifications: {
      type: [certificationSchema],
      default: []
    },

    licenses: [{
      name: String,
      issuingAuthority: String,
      licenseNumber: String,
      issueDate: Date,
      expiryDate: Date,
      verificationUrl: String
    }],

    // Projects & Portfolio
    projects: {
      type: [projectSchema],
      default: []
    },

    portfolio: {
      website: String,
      github: String,
      behance: String,
      dribbble: String,
      medium: String,
      otherLinks: [{
        platform: String,
        url: String,
        description: String
      }]
    },

    // Achievements & Awards
    achievements: [{
      title: String,
      issuer: String,
      date: Date,
      description: String,
      category: {
        type: String,
        enum: ['academic', 'professional', 'competition', 'certification', 'volunteer', 'other']
      },
      media: [{
        type: { type: String, enum: ['image', 'document', 'link'] },
        url: String,
        caption: String
      }]
    }],

    publications: [{
      title: String,
      publisher: String,
      date: Date,
      url: String,
      authors: [String],
      description: String,
      citationCount: Number
    }],

    // Job Preferences
    jobPreferences: {
      jobTypes: [{
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote']
      }],
      experienceLevel: {
        type: String,
        trim: true
      },
      preferredRoles: [String],
      industries: [String],
      locations: [{
        city: String,
        state: String,
        country: String,
        type: { type: String, enum: ['on-site', 'hybrid', 'remote'] },
        preference: { type: Number, min: 1, max: 3 } // 1=most preferred
      }],
      salaryExpectation: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'USD' },
        period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' }
      },
      noticePeriod: { type: Number, default: 30 }, // days
      relocationWillingness: {
        type: String,
        enum: ['not-willing', 'willing', 'already-relocated', 'remote-only'],
        default: 'not-willing'
      },
      visaSponsorship: { type: Boolean, default: false },
      workPermit: String,
      startDate: Date,
      travelWillingness: {
        type: String,
        enum: ['none', 'occasional', 'frequent', 'extensive']
      }
    },

    // Resume & Documents
    documents: {
      resumeUrl: String,
      resumeFileName: String,
      resumeLastUpdated: Date,
      coverLetterTemplate: String,
      additionalDocuments: [{
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now }
      }]
    },

    // Social Links
    socialLinks: {
      type: [socialLinkSchema],
      default: []
    },

    // Network & Connections
    network: {
      connections: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        connectedAt: { type: Date, default: Date.now },
        relationship: String,
        notes: String
      }],
      connectionCount: { type: Number, default: 0 },
      followers: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        followedAt: { type: Date, default: Date.now }
      }],
      followerCount: { type: Number, default: 0 },
      followingCompanies: [{
        company: { type: Schema.Types.ObjectId, ref: 'Employer' },
        followedAt: { type: Date, default: Date.now },
        notifications: { type: Boolean, default: true }
      }],
      recommendations: [{
        recommender: { type: Schema.Types.ObjectId, ref: 'User' },
        relationship: String,
        content: String,
        date: { type: Date, default: Date.now },
        skills: [String],
        isPublic: { type: Boolean, default: true }
      }],
      endorsementsGiven: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        skill: String,
        endorsedAt: { type: Date, default: Date.now }
      }]
    },

    // Availability Status
    availability: {
      status: {
        type: String,
        enum: ['actively-looking', 'open-to-offers', 'not-looking', 'available-freelance'],
        default: 'actively-looking'
      },
      availableFrom: Date,
      preferredWorkSchedule: String,
      hoursPerWeek: Number
    },

    // Metrics & Analytics
    metrics: {
      profileViews: { type: Number, default: 0 },
      profileViewers: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        company: { type: Schema.Types.ObjectId, ref: 'Employer' },
        viewedAt: { type: Date, default: Date.now },
        source: String
      }],
      searchAppearances: { type: Number, default: 0 },
      applications: {
        total: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        reviewed: { type: Number, default: 0 },
        shortlisted: { type: Number, default: 0 },
        interviewed: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        accepted: { type: Number, default: 0 }
      },
      interviewRate: { type: Number, default: 0 },
      offerRate: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
      profileStrength: { type: Number, default: 0, min: 0, max: 100 }
    },

    // Profile Completeness
    profileCompleteness: {
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      lastCalculated: { type: Date, default: Date.now },
      completedSections: [String],
      missingFields: [String],
      suggestions: [{
        section: String,
        field: String,
        priority: { type: String, enum: ['low', 'medium', 'high'] }
      }]
    },

    // Privacy & Visibility Settings
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'connections-only', 'private'],
        default: 'public'
      },
      resumeVisibility: {
        type: String,
        enum: ['public', 'connections-only', 'private', 'on-apply-only'],
        default: 'on-apply-only'
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showBirthDate: { type: Boolean, default: false },
      showConnections: { type: Boolean, default: true },
      showProfileViewers: { type: Boolean, default: true },
      dataSharing: {
        withRecruiters: { type: Boolean, default: true },
        forResearch: { type: Boolean, default: false },
        withPartners: { type: Boolean, default: false }
      }
    },

    // Notification Preferences
    notifications: {
      jobAlerts: {
        enabled: { type: Boolean, default: true },
        frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'daily' }
      },
      shortlisted: { type: Boolean, default: true },
      savedProfile: { type: Boolean, default: true },
      appliedExpired: { type: Boolean, default: true },
      rejected: { type: Boolean, default: true },
      jobAlertLimit: { type: Boolean, default: false },
      applicationUpdates: { type: Boolean, default: true },
      profileViews: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      connectionRequests: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      endorsements: { type: Boolean, default: true },
      companyUpdates: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: true }
    },

    // Job Alerts
    jobAlerts: [{
      name: String,
      keywords: [String],
      locations: [String],
      jobTypes: [String],
      industries: [String],
      experienceLevels: [String],
      salaryRange: {
        min: Number,
        max: Number
      },
      frequency: { type: String, enum: ['daily', 'weekly', 'instant'], default: 'daily' },
      isActive: { type: Boolean, default: true },
      lastSent: Date,
      alertCount: { type: Number, default: 0 }
    }],

    // Verification
    verification: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      identityVerified: { type: Boolean, default: false },
      skillsVerified: { type: Boolean, default: false },
      workExperienceVerified: { type: Boolean, default: false },
      educationVerified: { type: Boolean, default: false },
      verifiedBadges: [String],
      verificationScore: { type: Number, default: 0, min: 0, max: 100 }
    },

    // SEO & Discovery
    seo: {
      slug: {
        type: String,
        lowercase: true,
        trim: true
      },
      keywords: [String],
      searchTags: [String],
      headlineKeywords: [String]
    },

    // Subscription & Premium
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium', 'pro'],
        default: 'free'
      },
      features: [String],
      startedAt: Date,
      expiresAt: Date,
      autoRenew: { type: Boolean, default: false }
    },

    // Activity & Engagement
    lastActive: { type: Date, default: Date.now },
    profileCreated: { type: Date, default: Date.now },
    profileUpdated: { type: Date, default: Date.now },

    // Soft Delete
    deletedAt: {
      type: Date,
      default: null,
    },

    // Audit Trail
    auditLog: [{
      action: String,
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
applicantSchema.index({ 'personalInfo.headline': 'text', summary: 'text', 'skills.name': 'text' });
applicantSchema.index({ 'contactInfo.address.country': 1, 'contactInfo.address.city': 1 });
applicantSchema.index({ 'contactInfo.address.coordinates': '2dsphere' });
applicantSchema.index({ 'availability.status': 1, 'jobPreferences.jobTypes': 1 });
applicantSchema.index({ 'metrics.profileStrength': -1, 'verification.verificationScore': -1 });
applicantSchema.index({ 'seo.slug': 1 }, { unique: true, sparse: true });

// Virtuals
applicantSchema.virtual('fullName').get(function() {
  return `${this.personalInfo?.firstName || ''} ${this.personalInfo?.lastName || ''}`.trim();
});

applicantSchema.virtual('location').get(function() {
  const addr = this.contactInfo?.address;
  if (!addr) return '';
  return `${addr.city ? addr.city + ', ' : ''}${addr.state ? addr.state + ', ' : ''}${addr.country || ''}`.trim().replace(/,\s*$/, '');
});

// Pre-save hooks
applicantSchema.pre('save', function() {
  // Calculate total experience
  if (this.workExperience && this.workExperience.length > 0) {
    let totalMonths = 0;
    this.workExperience.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      const diffTime = Math.abs(end - start);
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      totalMonths += diffMonths;
    });
    
    this.totalExperience = {
      years: Math.floor(totalMonths / 12),
      months: totalMonths % 12
    };
  }

  // Generate slug if not exists
  if (!this.seo?.slug && this.personalInfo?.firstName && this.personalInfo?.lastName) {
    const slug = `${this.personalInfo.firstName.toLowerCase()}-${this.personalInfo.lastName.toLowerCase()}-${Math.random().toString(36).substr(2, 5)}`;
    if (!this.seo) this.seo = {};
    this.seo.slug = slug;
  }

  // Update timestamps
  this.profileUpdated = new Date();
  this.lastActive = new Date();

 
});

// Method to calculate profile completeness
applicantSchema.methods.calculateProfileCompleteness = function() {
  let score = 0;
  const totalFields = 15; // Adjust based on important fields
  const completed = [];

  if (this.personalInfo?.firstName && this.personalInfo?.lastName) {
    score += 10;
    completed.push('name');
  }
  if (this.personalInfo?.headline) {
    score += 5;
    completed.push('headline');
  }
  if (this.summary) {
    score += 10;
    completed.push('summary');
  }
  if (this.workExperience?.length > 0) {
    score += 15;
    completed.push('workExperience');
  }
  if (this.education?.length > 0) {
    score += 10;
    completed.push('education');
  }
  if (this.skills?.length > 0) {
    score += 10;
    completed.push('skills');
  }
  if (this.contactInfo?.email) {
    score += 5;
    completed.push('email');
  }
  if (this.contactInfo?.address?.city) {
    score += 5;
    completed.push('location');
  }
  if (this.documents?.resumeUrl) {
    score += 10;
    completed.push('resume');
  }
  if (this.personalInfo?.avatarUrl) {
    score += 5;
    completed.push('avatar');
  }
  if (this.languages?.length > 0) {
    score += 5;
    completed.push('languages');
  }
  if (this.certifications?.length > 0) {
    score += 5;
    completed.push('certifications');
  }
  if (this.projects?.length > 0) {
    score += 5;
    completed.push('projects');
  }

  this.profileCompleteness = {
    percentage: Math.min(100, score),
    lastCalculated: new Date(),
    completedSections: completed
  };

  return this.profileCompleteness.percentage;
};

module.exports = mongoose.model("Applicant", applicantSchema);
