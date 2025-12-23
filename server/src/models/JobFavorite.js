const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobFavoriteSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    
    company: {
      type: Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
      index: true
    },
    
    // 📌 SAVING CONTEXT
    savedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    // 🔖 ORGANIZATION & TAGGING
    folder: {
      type: String,
      enum: [
        'default',
        'to_apply',
        'applied',
        'interviewing',
        'offers',
        'research',
        'dream_companies',
        'considering',
        'archived'
      ],
      default: 'default',
      index: true
    },
    
    customFolder: {
      type: String,
      trim: true,
      maxlength: 50
    },
    
    tags: [{
      type: String,
      trim: true,
      maxlength: 20
    }],
    
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    
    // 📝 NOTES & REMINDERS
    notes: {
      type: String,
      maxlength: 2000,
      trim: true
    },
    
    reminders: [{
      type: Date,
      index: true
    }],
    
    nextActionDate: {
      type: Date,
      index: true
    },
    
    nextAction: {
      type: String,
      enum: [
        'apply',
        'research_company',
        'prepare_cv',
        'write_cover_letter',
        'follow_up',
        'prepare_for_interview',
        'negotiate_offer',
        'other'
      ]
    },
    
    // 📊 APPLICATION TRACKING
    applicationStatus: {
      type: String,
      enum: [
        'not_applied',
        'applied',
        'under_review',
        'interview_scheduled',
        'offer_received',
        'rejected',
        'withdrawn'
      ],
      default: 'not_applied',
      index: true
    },
    
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication"
    },
    
    appliedAt: Date,
    
    // 🔔 NOTIFICATIONS
    notifications: {
      deadline: {
        enabled: { type: Boolean, default: false },
        daysBefore: { type: Number, default: 3 }
      },
      statusChange: { type: Boolean, default: true },
      similarJobs: { type: Boolean, default: false },
      companyUpdates: { type: Boolean, default: true }
    },
    
    // 📈 ANALYTICS & METRICS
    metrics: {
      viewCount: { type: Number, default: 0 },
      lastViewed: Date,
      compareCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
      noteUpdates: { type: Number, default: 0 }
    },
    
    // 🎯 MATCHING SCORE
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    scoreBreakdown: {
      skills: { type: Number, min: 0, max: 100 },
      experience: { type: Number, min: 0, max: 100 },
      education: { type: Number, min: 0, max: 100 },
      location: { type: Number, min: 0, max: 100 },
      salary: { type: Number, min: 0, max: 100 }
    },
    
    // 🔄 COMPARISON FEATURES
    comparisonData: {
      salaryRank: Number,
      companyRating: Number,
      commuteTime: Number,
      benefitsScore: Number,
      growthPotential: Number
    },
    
    // ⭐ PERSONAL RATING
    personalRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    
    ratingComments: String,
    
    // 🎨 CUSTOMIZATION
    colorCode: {
      type: String,
      enum: ['default', 'red', 'blue', 'green', 'yellow', 'purple', 'orange']
    },
    
    isPinned: {
      type: Boolean,
      default: false
    },
    
    // 🔍 SEARCH & DISCOVERY
    source: {
      type: String,
      enum: [
        'search',
        'recommendation',
        'company_page',
        'social_share',
        'email_alert',
        'job_board',
        'referral',
        'career_fair'
      ],
      default: 'search'
    },
    
    searchQuery: String,
    
    // 📅 EXPIRY & ARCHIVING
    autoArchiveDate: Date,
    
    archivedAt: Date,
    
    archiveReason: {
      type: String,
      enum: [
        'applied',
        'expired',
        'hired',
        'not_interested',
        'duplicate',
        'other'
      ]
    },
    
    // 📊 SNAPSHOT DATA (for historical reference)
    snapshot: {
      jobTitle: String,
      companyName: String,
      location: String,
      salary: {
        min: Number,
        max: Number,
        currency: String
      },
      jobType: String,
      postedDate: Date,
      expirationDate: Date,
      remotePolicy: String,
      companyLogo: String
    },
    
    // 🔗 RELATED JOBS
    similarJobs: [{
      type: Schema.Types.ObjectId,
      ref: "Job"
    }],
    
    // 👥 COLLABORATION
    sharedWith: [{
      user: { type: Schema.Types.ObjectId, ref: "User" },
      sharedAt: { type: Date, default: Date.now },
      permission: {
        type: String,
        enum: ['view', 'comment', 'edit'],
        default: 'view'
      },
      notes: String
    }],
    
    // 📱 SYNC & DEVICES
    lastSynced: Date,
    
    syncDevices: [{
      deviceId: String,
      lastSync: Date,
      platform: String
    }],
    
    // 🏷️ PRIVACY
    isPrivate: {
      type: Boolean,
      default: true
    },
    
    // 🗑️ SOFT DELETE
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🔍 COMPOUND INDEXES FOR PERFORMANCE
jobFavoriteSchema.index({ applicant: 1, job: 1 }, { unique: true });
jobFavoriteSchema.index({ applicant: 1, folder: 1, savedAt: -1 });
jobFavoriteSchema.index({ applicant: 1, applicationStatus: 1, savedAt: -1 });
jobFavoriteSchema.index({ applicant: 1, priority: 1, matchScore: -1 });
jobFavoriteSchema.index({ applicant: 1, isPinned: -1, savedAt: -1 });
jobFavoriteSchema.index({ applicant: 1, nextActionDate: 1 });
jobFavoriteSchema.index({ company: 1, savedAt: -1 });
jobFavoriteSchema.index({ 'snapshot.jobTitle': 'text', 'snapshot.companyName': 'text', notes: 'text' });
jobFavoriteSchema.index({ applicant: 1, deletedAt: 1 });

// 🎯 VIRTUAL FIELDS
jobFavoriteSchema.virtual('isExpired').get(function() {
  if (!this.snapshot?.expirationDate) return false;
  return new Date() > new Date(this.snapshot.expirationDate);
});

jobFavoriteSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.snapshot?.expirationDate) return null;
  const expiry = new Date(this.snapshot.expirationDate);
  const today = new Date();
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

jobFavoriteSchema.virtual('isActive').get(function() {
  const inactiveStatuses = ['applied', 'rejected', 'withdrawn', 'archived'];
  return !inactiveStatuses.includes(this.applicationStatus) && !this.isExpired;
});

jobFavoriteSchema.virtual('urgencyLevel').get(function() {
  const days = this.daysUntilExpiry;
  if (days === null) return 'none';
  if (days <= 3) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
});

// ⚡ PRE-SAVE HOOKS
jobFavoriteSchema.pre('save', function() {
  // Auto-update folder based on application status
  if (this.isModified('applicationStatus')) {
    switch (this.applicationStatus) {
      case 'not_applied':
        this.folder = 'to_apply';
        break;
      case 'applied':
        this.folder = 'applied';
        this.appliedAt = this.appliedAt || new Date();
        break;
      case 'interview_scheduled':
        this.folder = 'interviewing';
        break;
      case 'offer_received':
        this.folder = 'offers';
        break;
      case 'rejected':
      case 'withdrawn':
        this.folder = 'archived';
        this.archivedAt = new Date();
        this.archiveReason = this.applicationStatus;
        break;
    }
  }
  
  // Set auto-archive date for expired jobs
  if (this.snapshot?.expirationDate && !this.autoArchiveDate) {
    const expiry = new Date(this.snapshot.expirationDate);
    expiry.setDate(expiry.getDate() + 30); // Archive 30 days after expiry
    this.autoArchiveDate = expiry;
  }
  
  // Update metrics
  this.metrics.lastViewed = new Date();
  
});

// 🎯 STATIC METHODS
jobFavoriteSchema.statics.getSavedJobsStats = async function(applicantId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        applicant: mongoose.Types.ObjectId(applicantId),
        deletedAt: null 
      } 
    },
    {
      $group: {
        _id: '$folder',
        count: { $sum: 1 },
        avgMatchScore: { $avg: '$matchScore' },
        appliedCount: {
          $sum: {
            $cond: [{ $in: ['$applicationStatus', ['applied', 'under_review', 'interview_scheduled', 'offer_received']] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        folder: '$_id',
        count: 1,
        avgMatchScore: { $round: ['$avgMatchScore', 1] },
        appliedCount: 1,
        applicationRate: {
          $cond: [
            { $eq: ['$count', 0] },
            0,
            { $multiply: [{ $divide: ['$appliedCount', '$count'] }, 100] }
          ]
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

jobFavoriteSchema.statics.findExpiringSoon = function(applicantId, days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  
  return this.find({
    applicant: applicantId,
    'snapshot.expirationDate': { 
      $lte: date,
      $gte: new Date() 
    },
    applicationStatus: 'not_applied',
    deletedAt: null
  }).sort({ 'snapshot.expirationDate': 1 });
};

jobFavoriteSchema.statics.getRecommendedFolders = async function(applicantId, limit = 10) {
  const savedJobs = await this.find({
    applicant: applicantId,
    deletedAt: null
  }).populate('job', 'title industry skills');
  
  const industryCount = {};
  const skillCount = {};
  
  savedJobs.forEach(job => {
    if (job.job?.industry) {
      industryCount[job.job.industry] = (industryCount[job.job.industry] || 0) + 1;
    }
    
    if (job.job?.skills) {
      job.job.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    }
  });
  
  return {
    topIndustries: Object.entries(industryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([industry, count]) => ({ industry, count })),
    topSkills: Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 2)
      .map(([skill, count]) => ({ skill, count }))
  };
};

// ⚙️ INSTANCE METHODS
jobFavoriteSchema.methods.addReminder = function(date, type = 'apply') {
  if (!this.reminders) this.reminders = [];
  this.reminders.push(date);
  this.nextActionDate = date;
  this.nextAction = type;
  
  return this.save();
};

jobFavoriteSchema.methods.moveToFolder = function(folderName, isCustom = false) {
  if (isCustom) {
    this.customFolder = folderName;
    this.folder = 'default';
  } else {
    this.folder = folderName;
    this.customFolder = null;
  }
  
  return this.save();
};

jobFavoriteSchema.methods.updateApplicationStatus = function(status, applicationId = null) {
  this.applicationStatus = status;
  
  if (applicationId) {
    this.applicationId = applicationId;
  }
  
  if (status === 'applied') {
    this.appliedAt = new Date();
  }
  
  return this.save();
};

jobFavoriteSchema.methods.calculateMatchScore = async function(applicantProfile) {
  // This would typically integrate with your matching algorithm
  let score = 0;
  const breakdown = { skills: 0, experience: 0, education: 0, location: 0, salary: 0 };
  
  // Simple example calculation
  if (applicantProfile.skills && this.job?.skills) {
    const matchingSkills = applicantProfile.skills.filter(skill => 
      this.job.skills.includes(skill)
    );
    breakdown.skills = (matchingSkills.length / this.job.skills.length) * 100;
  }
  
  // Calculate overall score
  const values = Object.values(breakdown).filter(v => v > 0);
  score = values.length > 0 
    ? values.reduce((a, b) => a + b, 0) / values.length 
    : 0;
  
  this.matchScore = Math.round(score);
  this.scoreBreakdown = breakdown;
  
  return this.save();
};

jobFavoriteSchema.methods.getSimilarJobs = async function(limit = 5) {
  if (!this.job) return [];
  
  const Job = mongoose.model('Job');
  
  return Job.find({
    _id: { $ne: this.job._id },
    company: this.company,
    $or: [
      { title: { $regex: this.snapshot?.jobTitle || '', $options: 'i' } },
      { skills: { $in: this.job.skills || [] } }
    ]
  })
  .limit(limit)
  .select('title location salaryType minSalary maxSalary isRemote');
};

// 🎨 QUERY HELPERS
jobFavoriteSchema.query.byApplicant = function(applicantId) {
  return this.where({ applicant: applicantId, deletedAt: null });
};

jobFavoriteSchema.query.byFolder = function(folder) {
  return this.where({ folder, deletedAt: null });
};

jobFavoriteSchema.query.active = function() {
  return this.where({ 
    applicationStatus: { $in: ['not_applied', 'applied', 'under_review'] },
    deletedAt: null 
  });
};

jobFavoriteSchema.query.withHighMatch = function(minScore = 70) {
  return this.where({ matchScore: { $gte: minScore } });
};

// 📊 AGGREGATION PIPELINES
jobFavoriteSchema.statics.getFolderAnalytics = async function(applicantId) {
  return this.aggregate([
    { $match: { applicant: mongoose.Types.ObjectId(applicantId), deletedAt: null } },
    {
      $group: {
        _id: '$folder',
        total: { $sum: 1 },
        avgMatchScore: { $avg: '$matchScore' },
        applied: {
          $sum: { $cond: [{ $eq: ['$applicationStatus', 'applied'] }, 1, 0] }
        },
        interviews: {
          $sum: { $cond: [{ $eq: ['$applicationStatus', 'interview_scheduled'] }, 1, 0] }
        },
        offers: {
          $sum: { $cond: [{ $eq: ['$applicationStatus', 'offer_received'] }, 1, 0] }
        },
        avgDaysSaved: {
          $avg: { $divide: [{ $subtract: [new Date(), '$savedAt'] }, 1000 * 60 * 60 * 24] }
        }
      }
    },
    {
      $project: {
        folder: '$_id',
        total: 1,
        avgMatchScore: { $round: ['$avgMatchScore', 1] },
        applied: 1,
        interviews: 1,
        offers: 1,
        applicationRate: { 
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$applied', '$total'] }, 100] }
          ]
        },
        avgDaysSaved: { $round: ['$avgDaysSaved', 1] }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

// 🔄 MIDDLEWARE FOR AUTO-CLEANUP
jobFavoriteSchema.post('find', function(docs) {
  // Auto-archive expired jobs when queried
  const expiredJobs = docs.filter(doc => doc.isExpired && doc.folder !== 'archived');
  
  if (expiredJobs.length > 0) {
    const ids = expiredJobs.map(doc => doc._id);
    mongoose.model('JobFavorite').updateMany(
      { _id: { $in: ids } },
      { 
        $set: { 
          folder: 'archived',
          archivedAt: new Date(),
          archiveReason: 'expired'
        }
      }
    ).exec();
  }
});

module.exports = mongoose.model("JobFavorite", jobFavoriteSchema);