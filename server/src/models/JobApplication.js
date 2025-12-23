const mongoose = require("mongoose");
const { Schema } = mongoose;

const timelineEventSchema = new Schema({
  event: {
    type: String,
    enum: [
      'applied', 
      'viewed', 
      'shortlisted', 
      'interview_scheduled',
      'interview_completed', 
      'assessment_sent',
      'assessment_completed', 
      'offer_sent',
      'offer_accepted', 
      'offer_rejected',
      'rejected', 
      'withdrawn', 
      'on_hold',
      'contacted', 
      'document_requested',
      'document_received', 
      'reference_check',
      'background_check', 
      'hired'
    ],
    required: true
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  performedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  notes: String,
  metadata: Schema.Types.Mixed,
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, { _id: true });

const interviewSchema = new Schema({
  type: {
    type: String,
    enum: ['phone', 'video', 'in_person', 'technical', 'hr', 'cultural', 'panel', 'group'],
    required: true
  },
  round: { type: Number, default: 1 },
  scheduledDate: { type: Date, required: true },
  actualDate: Date,
  duration: { type: Number, default: 60 }, // in minutes
  timezone: String,
  interviewers: [{
    name: String,
    email: String,
    role: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    attended: { type: Boolean, default: false }
  }],
  meetingLink: String,
  location: String,
  agenda: String,
  preparationNotes: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show', 'in_progress'],
    default: 'scheduled'
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    strengths: [String],
    weaknesses: [String],
    recommendation: {
      type: String,
      enum: ['strong_yes', 'yes', 'maybe', 'no', 'strong_no', 'not_recommended']
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date,
    isShared: { type: Boolean, default: false }
  },
  notes: String,
  recordings: [{
    url: String,
    password: String,
    expiresAt: Date
  }],
  followUpActions: [String]
}, { timestamps: true });

const assessmentSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['technical_test', 'coding_challenge', 'case_study', 
           'personality_test', 'language_test', 'skill_assessment',
           'presentation', 'take_home_project'],
    required: true
  },
  description: String,
  sentDate: { type: Date, default: Date.now },
  dueDate: Date,
  completedDate: Date,
  score: Number,
  maxScore: Number,
  result: String,
  feedback: String,
  url: String,
  loginCredentials: {
    username: String,
    password: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now },
    size: Number
  }],
  submittedWork: [{
    name: String,
    url: String,
    submittedAt: Date
  }],
  evaluator: { type: Schema.Types.ObjectId, ref: 'User' },
  evaluatedAt: Date
}, { timestamps: true });

const communicationSchema = new Schema({
  type: {
    type: String,
    enum: ['email', 'message', 'call', 'note', 'system'],
    required: true
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing', 'internal'],
    required: true
  },
  subject: String,
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  recipients: [{
    email: String,
    name: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  read: { type: Boolean, default: false },
  readAt: Date,
  starred: { type: Boolean, default: false },
  labels: [String],
  templateId: String,
  automation: {
    isAutomated: { type: Boolean, default: false },
    trigger: String,
    sequence: Number
  }
}, { timestamps: true });

const offerSchema = new Schema({
  status: {
    type: String,
    enum: ['not_sent', 'draft', 'sent', 'negotiating', 'accepted', 'rejected', 'expired', 'withdrawn'],
    default: 'not_sent'
  },
  details: {
    position: String,
    department: String,
    salary: Number,
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['yearly', 'monthly', 'hourly', 'project'], default: 'yearly' },
    bonus: {
      amount: Number,
      conditions: String
    },
    equity: String,
    benefits: [String],
    startDate: Date,
    probationPeriod: { type: Number, default: 90 }, // in days
    noticePeriod: { type: Number, default: 30 }, // in days
    workLocation: String,
    workSchedule: String,
    reportingTo: String,
    equipmentProvided: [String]
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    signed: { type: Boolean, default: false },
    signedAt: Date
  }],
  sentDate: Date,
  expirationDate: Date,
  acceptedDate: Date,
  rejectedDate: Date,
  rejectionReason: String,
  negotiationHistory: [{
    date: { type: Date, default: Date.now },
    from: { type: String, enum: ['employer', 'candidate'] },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    previousOffer: Schema.Types.Mixed,
    newOffer: Schema.Types.Mixed,
    notes: String,
    status: String
  }],
  version: { type: Number, default: 1 }
}, { timestamps: true });

const screeningResponseSchema = new Schema({
  question: { type: String, required: true },
  answer: String,
  type: {
    type: String,
    enum: ['text', 'multiple_choice', 'file', 'yes_no', 'scale'],
    default: 'text'
  },
  options: [String],
  required: { type: Boolean, default: false },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  evaluated: { type: Boolean, default: false },
  evaluation: {
    score: Number,
    feedback: String,
    evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    evaluatedAt: Date
  }
}, { _id: false });

const jobApplicationSchema = new Schema(
  {
    // Basic References
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
      index: true
    },

    // Application Status
    status: {
      type: String,
      enum: [
        'applied', 
        'under_review', 
        'shortlisted', 
        'interview', 
        'assessment',
        'offer', 
        'hired', 
        'rejected', 
        'withdrawn', 
        'on_hold',
        'archived'
      ],
      default: 'applied',
      index: true
    },
    
    subStatus: {
      type: String,
      enum: [
        'new', 'reviewed', 'phone_screen', 'technical_interview',
        'final_interview', 'offer_pending', 'offer_accepted',
        'offer_declined', 'not_qualified', 'position_filled',
        'candidate_unresponsive', 'duplicate', 'other'
      ]
    },

    // Snapshot Data (from applicant profile at time of application)
    snapshot: {
      personal: {
        name: String,
        email: String,
        phone: String,
        location: String,
        avatarUrl: String,
        headline: String
      },
      professional: {
        currentRole: String,
        currentCompany: String,
        totalExperience: {
          years: Number,
          months: Number
        },
        education: [{
          degree: String,
          institution: String,
          year: Number
        }],
        skills: [{
          name: String,
          level: String,
          years: Number
        }],
        certifications: [String],
        languages: [{
          language: String,
          proficiency: String
        }]
      },
      documents: {
        resumeUrl: String,
        resumeName: String,
        coverLetter: {
          content: String,
          customized: { type: Boolean, default: false }
        },
        portfolioUrl: String,
        otherDocuments: [{
          name: String,
          url: String,
          type: String
        }]
      },
      salaryExpectation: {
        min: Number,
        max: Number,
        currency: String,
        period: String
      },
      availability: {
        noticePeriod: Number,
        startDate: Date,
        relocation: Boolean,
        remoteWork: Boolean
      }
    },

    // Custom Application Data
    customResponses: [screeningResponseSchema],

    // Timeline & History
    timeline: {
      type: [timelineEventSchema],
      default: []
    },

    appliedAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    viewedAt: Date,
    shortlistedAt: Date,
    rejectedAt: Date,
    hiredAt: Date,
    withdrawnAt: Date,

    // Interviews
    interviews: {
      type: [interviewSchema],
      default: []
    },

    nextInterview: {
      scheduledDate: Date,
      type: String,
      round: Number
    },

    // Assessments
    assessments: {
      type: [assessmentSchema],
      default: []
    },

    // Communications
    communications: {
      type: [communicationSchema],
      default: []
    },

    lastContact: Date,
    unreadMessages: { 
      type: Number, 
      default: 0 
    },

    // Offer Management
    offer: offerSchema,

    // Evaluation & Feedback
    evaluation: {
      score: { 
        type: Number, 
        min: 0, 
        max: 100 
      },
      breakdown: {
        experience: { type: Number, min: 0, max: 100 },
        skills: { type: Number, min: 0, max: 100 },
        education: { type: Number, min: 0, max: 100 },
        culturalFit: { type: Number, min: 0, max: 100 },
        communication: { type: Number, min: 0, max: 100 }
      },
      tags: [{
        name: String,
        category: String,
        addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
      }],
      notes: String,
      evaluator: { type: Schema.Types.ObjectId, ref: 'User' },
      evaluatedAt: Date,
      comparison: {
        rank: Number,
        percentile: Number,
        totalApplicants: Number
      },
      aiAnalysis: {
        matchScore: Number,
        strengths: [String],
        gaps: [String],
        recommendations: [String]
      }
    },

    // Internal Management
    saved: {
      type: Boolean,
      default: false
    },

    starred: {
      type: Boolean,
      default: false
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    labels: [String],

    team: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      role: {
        type: String,
        enum: ['recruiter', 'hiring_manager', 'interviewer', 'coordinator']
      },
      assignedAt: { type: Date, default: Date.now }
    }],

    // Analytics & Metrics
    metrics: {
      timeToView: Number, // hours
      timeToFirstResponse: Number, // hours
      timeToHire: Number, // days
      interviewCount: { type: Number, default: 0 },
      assessmentCount: { type: Number, default: 0 },
      communicationCount: { type: Number, default: 0 },
      lastActivity: Date,
      applicationSource: {
        type: String,
        enum: [
          'direct', 
          'referral', 
          'job_board', 
          'social_media', 
          'agency', 
          'career_fair',
          'company_website', 
          'employee_referral', 
          'campus', 
          'other'
        ],
        default: 'direct'
      },
      referral: {
        referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
        relationship: String,
        bonusEligible: { type: Boolean, default: false },
        bonusPaid: { type: Boolean, default: false }
      },
      campaign: {
        id: String,
        name: String,
        source: String,
        medium: String
      }
    },

    // Privacy & Settings
    privacy: {
      visibleToCompany: { type: Boolean, default: true },
      visibleToTeam: { type: Boolean, default: true },
      allowContact: { type: Boolean, default: true },
      shareProfile: { type: Boolean, default: true },
      dataRetention: {
        autoDeleteAfter: Date,
        keepForFutureRoles: { type: Boolean, default: false },
        consentGiven: { type: Boolean, default: false }
      }
    },

    // Integration & External Systems
    externalIds: {
      atsId: String,
      crmId: String,
      calendarId: String,
      assessmentPlatformId: String
    },

    // Audit Trail
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

    // Soft Delete
    deletedAt: {
      type: Date,
      default: null
    },

    // Versioning
    version: { 
      type: Number, 
      default: 1 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound Indexes
jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
jobApplicationSchema.index({ company: 1, status: 1, appliedAt: -1 });
jobApplicationSchema.index({ applicant: 1, status: 1, appliedAt: -1 });
jobApplicationSchema.index({ 'snapshot.personal.email': 1 });
jobApplicationSchema.index({ 'snapshot.personal.name': 'text', 'snapshot.professional.currentRole': 'text' });
jobApplicationSchema.index({ priority: 1, appliedAt: -1 });
jobApplicationSchema.index({ saved: 1, starred: 1 });
jobApplicationSchema.index({ 'metrics.lastActivity': -1 });

// Virtuals
jobApplicationSchema.virtual('daysSinceApplied').get(function() {
  if (!this.appliedAt) return 0;
  const diffTime = Math.abs(new Date() - this.appliedAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

jobApplicationSchema.virtual('isActive').get(function() {
  const inactiveStatuses = ['hired', 'rejected', 'withdrawn', 'archived'];
  return !inactiveStatuses.includes(this.status);
});

jobApplicationSchema.virtual('nextAction').get(function() {
  if (this.status === 'applied') return 'Review application';
  if (this.status === 'shortlisted') return 'Schedule interview';
  if (this.status === 'interview' && this.interviews?.length > 0) {
    const lastInterview = this.interviews[this.interviews.length - 1];
    if (lastInterview.status === 'completed') return 'Provide feedback';
    return 'Conduct interview';
  }
  if (this.status === 'assessment') return 'Review assessment';
  if (this.status === 'offer') return 'Follow up on offer';
  return 'No action needed';
});

// Pre-save hooks
jobApplicationSchema.pre('save', function() {
  // Auto-update timeline based on status changes
  if (this.isModified('status')) {
    this.timeline.push({
      event: this.status,
      date: new Date(),
      notes: `Status changed to ${this.status}`
    });

    // Update specific timestamp fields
    const now = new Date();
    switch (this.status) {
      case 'viewed':
        this.viewedAt = now;
        break;
      case 'shortlisted':
        this.shortlistedAt = now;
        break;
      case 'rejected':
        this.rejectedAt = now;
        break;
      case 'hired':
        this.hiredAt = now;
        break;
      case 'withdrawn':
        this.withdrawnAt = now;
        break;
    }
  }

  // Calculate metrics
  if (this.viewedAt && this.appliedAt && !this.metrics.timeToView) {
    const diffHours = (this.viewedAt - this.appliedAt) / (1000 * 60 * 60);
    this.metrics.timeToView = Math.round(diffHours);
  }

  // Update last activity
  this.metrics.lastActivity = new Date();

  // Increment version on significant changes
  const significantFields = ['status', 'offer', 'evaluation', 'snapshot'];
  if (significantFields.some(field => this.isModified(field))) {
    this.version += 1;
  }
});

// Static Methods
jobApplicationSchema.statics.findByStatus = function(status, companyId) {
  return this.find({ 
    status, 
    company: companyId,
    deletedAt: null 
  }).sort({ appliedAt: -1 });
};

jobApplicationSchema.statics.getApplicationStats = async function(companyId) {
  const stats = await this.aggregate([
    { $match: { company: companyId, deletedAt: null } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDays: { $avg: { $divide: [{ $subtract: [new Date(), '$appliedAt'] }, 1000 * 60 * 60 * 24] } }
      }
    }
  ]);
  
  return stats.reduce((acc, curr) => {
    acc[curr._id] = { count: curr.count, avgDays: Math.round(curr.avgDays) };
    return acc;
  }, {});
};

// Instance Methods
jobApplicationSchema.methods.addCommunication = function(communication) {
  this.communications.push(communication);
  this.lastContact = new Date();
  if (communication.direction === 'incoming') {
    this.unreadMessages += 1;
  }
  return this.save();
};

jobApplicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push(interviewData);
  this.nextInterview = {
    scheduledDate: interviewData.scheduledDate,
    type: interviewData.type,
    round: interviewData.round || 1
  };
  this.status = 'interview';
  
  this.timeline.push({
    event: 'interview_scheduled',
    date: new Date(),
    notes: `Interview scheduled for ${interviewData.scheduledDate}`
  });
  
  return this.save();
};

jobApplicationSchema.methods.updateEvaluation = function(evaluationData, evaluatorId) {
  this.evaluation = {
    ...this.evaluation,
    ...evaluationData,
    evaluator: evaluatorId,
    evaluatedAt: new Date()
  };
  
  // Auto-calculate overall score if breakdown provided
  if (evaluationData.breakdown) {
    const scores = Object.values(evaluationData.breakdown).filter(score => typeof score === 'number');
    if (scores.length > 0) {
      this.evaluation.score = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }
  
  return this.save();
};

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
