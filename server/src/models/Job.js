// server/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Reference to Employer (company)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer', // ✅ This should reference your Employer model
    required: true,
    index: true
  },

  // Basic Info
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 200
  },

  slug: {
    type: String,
    unique: true,
    index: true
  },

  jobRole: {
    type: String,
    required: [true, 'Job role is required'],
    enum: [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Mobile Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Product Manager',
      'UI/UX Designer',
      'QA Engineer'
    ]
  },

  description: {
    type: String,
    required: [true, 'Job description is required']
  },

  summary: String,

  // Skills
  skillsRequired: [{
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Intermediate'
    }
  }],

  responsibilities: [String],
  qualifications: [String],

  // Salary
  minSalary: Number,
  maxSalary: Number,
  salaryCurrency: {
    type: String,
    default: 'USD'
  },
  salaryType: {
    type: String,
    enum: ['Yearly', 'Monthly', 'Hourly', 'Project-based'],
    default: 'Yearly'
  },
  isSalaryVisible: {
    type: Boolean,
    default: true
  },
  bonusPotential: Number,

  // Job Details
  employmentType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Volunteer']
  },

  experienceLevel: {
    type: String,
    required: true,
    enum: ['Entry', 'Associate', 'Mid-Senior', 'Director', 'Executive']
  },

  educationLevel: {
    type: String,
    enum: ['Any', 'High School', 'Associate', 'Bachelor', 'Master', 'PhD', 'MBA'],
    default: 'Any'
  },

  jobLevel: String,

  // Location
  workLocationType: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },

  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Benefits
  benefits: [{
    category: String,
    name: String
  }],

  // Application
  applicationDeadline: Date,
  
  applicationProcess: {
    type: String,
    enum: ['Easy Apply', 'Company Website', 'Email', 'Phone'],
    default: 'Easy Apply'
  },

  applicationUrl: String,
  applicationEmail: String,

  // Team
  teamSize: Number,
  teamDescription: String,

  // Culture & Tags
  companyCulture: [String],
  industries: [String],
  functions: [String],
  keywords: [String],

  // Promotion
  isPromoted: {
    type: Boolean,
    default: false
  },

  isUrgent: {
    type: Boolean,
    default: false
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'paused'],
    default: 'active',
    index: true
  },

  // Metadata
  postedDate: {
    type: Date,
    default: Date.now
  },

  lastRenewed: Date,

  views: {
    type: Number,
    default: 0
  },

  applicationCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1, postedDate: -1 });
jobSchema.index({ company: 1, status: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;