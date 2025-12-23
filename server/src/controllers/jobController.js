// server/controllers/jobController.js
const Job = require('../models/Job');
const Company = require('../models/Company');
const JobApplication = require('../models/JobApplication');
const Applicant = require('../models/Applicant');
const SavedCandidate = require('../models/SavedCandidate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const APPLICATION_STATUS_VALUES = JobApplication.schema.path("status").enumValues;

const normalizeSalaryType = (value = '') => {
  const normalized = value.toLowerCase();
  if (normalized.includes('year')) return 'year';
  if (normalized.includes('month')) return 'month';
  if (normalized.includes('hour')) return 'hour';
  return normalized || 'year';
};

const formatJobLocation = (address = {}) => {
  const parts = [address.city, address.state, address.country]
    .filter(Boolean)
    .map((part) => part.trim());
  return parts.join(', ');
};

const buildEmployerInfo = (company) => {
  if (!company) {
    return {
      companyName: '',
      logo: '',
      industry: '',
      teamSize: '',
      location: '',
    };
  }

  return {
    id: company._id,
    companyName: company.companyName || company.name || '',
    logo:
      company.avatarUrl ||
      company.media?.logoVariants?.primary ||
      '',
    industry: company.industry || '',
    teamSize: company.teamSize || '',
    location: formatJobLocation(company.headquarters || {}) || company.location || '',
  };
};

const formatJobSkills = (job) => {
  if (Array.isArray(job.skillsRequired) && job.skillsRequired.length) {
    return job.skillsRequired
      .map((skill) => skill?.name)
      .filter(Boolean);
  }
  if (Array.isArray(job.keywords)) {
    return job.keywords.filter(Boolean);
  }
  return [];
};

const serializeJobForList = (job) => {
  const employer = buildEmployerInfo(job.company);

  return {
    _id: job._id,
    title: job.title,
    employer,
    jobType: job.employmentType,
    experience: job.experienceLevel,
    isRemote: job.workLocationType === 'Remote',
    workLocationType: job.workLocationType,
    location: formatJobLocation(job.address || {}),
    city: job.address?.city || '',
    country: job.address?.country || '',
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    salaryCurrency: job.salaryCurrency,
    salaryType: normalizeSalaryType(job.salaryType || ''),
    tags: formatJobSkills(job),
    description: job.summary || job.description || '',
    postedAt: job.postedDate,
    applications: job.applicationCount || 0,
    jobLevel: job.jobLevel || job.experienceLevel,
    education: job.educationLevel,
  };
};

const serializeJobForDetail = (job) => {
  const base = serializeJobForList(job);

  return {
    ...base,
    description: job.description,
    summary: job.summary,
    responsibilities: job.responsibilities || [],
    qualifications: job.qualifications || [],
    benefits: Array.isArray(job.benefits)
      ? job.benefits.map((benefit) => benefit.name || benefit).filter(Boolean)
      : [],
    applicationDeadline: job.applicationDeadline,
    bonusPotential: job.bonusPotential,
    company: {
      ...base.employer,
      description: job.company?.description || '',
      website: job.company?.websiteUrl || '',
      banner: job.company?.bannerImageUrl || '',
      socialLinks: job.company?.socialLinks || [],
    },
  };
};

/**
 * Create job
 * POST /api/employers/jobs
 */
const createJob = asyncHandler(async (req, res) => {
  // Log incoming request for debugging
  console.log('Create job request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user);

  const {
    title,
    jobRole,
    skillsRequired,
    responsibilities,
    qualifications,
    minSalary,
    maxSalary,
    salaryCurrency,
    salaryType,
    isSalaryVisible,
    bonusPotential,
    employmentType,
    experienceLevel,
    educationLevel,
    workLocationType,
    address,
    benefits,
    applicationDeadline,
    applicationProcess,
    applicationUrl,
    applicationEmail,
    description,
    summary,
    teamSize,
    teamDescription,
    companyCulture,
    industries,
    functions,
    keywords,
    isPromoted,
    isUrgent,
    status = 'active'
  } = req.body;

  // Validate required fields
  if (!title || !title.trim()) {
    throw new ApiError(400, 'Job title is required');
  }

  if (!jobRole) {
    throw new ApiError(400, 'Job role is required');
  }

  if (!description || !description.trim()) {
    throw new ApiError(400, 'Job description is required');
  }

  if (!employmentType) {
    throw new ApiError(400, 'Employment type is required');
  }

  // Get company ID from authenticated user (this is actually the Employer ID)
  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(400, 'No company profile found. Please complete your employer profile first.');
  }

  // Check if employer exists
  const Employer = require('../models/Employer');
  const employer = await Employer.findById(companyId);
  if (!employer) {
    throw new ApiError(404, 'Employer profile not found');
  }

  // Generate unique slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);
  
  let slug = baseSlug;
  let counter = 1;
  while (await Job.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create job
  const job = new Job({
    company: companyId,
    title,
    jobRole,
    skillsRequired: skillsRequired || [],
    responsibilities: responsibilities || [],
    qualifications: qualifications || [],
    minSalary: minSalary ? Number(minSalary) : undefined,
    maxSalary: maxSalary ? Number(maxSalary) : undefined,
    salaryCurrency: salaryCurrency || 'USD',
    salaryType: salaryType || 'Yearly',
    isSalaryVisible: isSalaryVisible !== undefined ? isSalaryVisible : true,
    bonusPotential: bonusPotential ? Number(bonusPotential) : undefined,
    employmentType,
    experienceLevel,
    educationLevel: educationLevel || 'Any',
    workLocationType,
    address: address || {},
    benefits: benefits || [],
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
    applicationProcess: applicationProcess || 'Easy Apply',
    applicationUrl,
    applicationEmail,
    description,
    summary,
    teamSize: teamSize ? Number(teamSize) : undefined,
    teamDescription,
    companyCulture: companyCulture || [],
    industries: industries || [],
    functions: functions || [],
    keywords: keywords || [],
    isPromoted: isPromoted || false,
    isUrgent: isUrgent || false,
    status,
    slug,
    postedDate: new Date()
  });

  // Save to database
  await job.save();

  // Populate employer info (using 'company' field which points to Employer)
  await job.populate('company', 'companyName avatarUrl industry teamSize location');

  return res.status(201).json({
    status: 'SUCCESS',
    message: 'Job created successfully',
    data: job
  });
});

/**
 * Update job
 * PUT /api/employers/jobs/:jobId
 */
const updateJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const updateData = req.body;

  // Find job
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Check if user owns this job
  if (job.company.toString() !== req.user.companyId.toString()) {
    throw new ApiError(403, 'Not authorized to update this job');
  }

  // If title is updated, update slug too
  if (updateData.title && updateData.title !== job.title) {
    const baseSlug = updateData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);
    
    let slug = baseSlug;
    let counter = 1;
    while (await Job.findOne({ slug, _id: { $ne: jobId } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    updateData.slug = slug;
  }

  // Update numeric fields
  if (updateData.minSalary) updateData.minSalary = Number(updateData.minSalary);
  if (updateData.maxSalary) updateData.maxSalary = Number(updateData.maxSalary);
  if (updateData.bonusPotential) updateData.bonusPotential = Number(updateData.bonusPotential);
  if (updateData.teamSize) updateData.teamSize = Number(updateData.teamSize);

  // Update job
  Object.assign(job, updateData);
  job.lastRenewed = new Date();
  
  await job.save();

  // Populate company info
  await job.populate('company', 'name logo industry size headquarters');

  return res.json({
    status: 'SUCCESS',
    message: 'Job updated successfully',
    data: job
  });
});

/**
 * Get all jobs for current employer company
 * GET /api/employers/jobs
 */
const getCompanyJobs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const companyId = req.user.companyId;

  let query = { company: companyId };
  
  if (status && status !== 'all') {
    query.status = status;
  }

  const jobs = await Job.find(query)
    .populate('company', 'name logo')
    .sort({ postedDate: -1 });

  return res.json({
    status: 'SUCCESS',
    data: jobs
  });
});

/**
 * Get single job (with view increment)
 * GET /api/employers/jobs/:jobId
 */
const getJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId)
    .populate('company', 'name logo industry size headquarters website description');

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Increment views
  job.views = (job.views || 0) + 1;
  await job.save();

  return res.json({
    status: 'SUCCESS',
    data: job
  });
});

/**
 * Delete job
 * DELETE /api/employers/jobs/:jobId
 */
const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Check if user owns this job
  if (job.company.toString() !== req.user.companyId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this job');
  }

  await job.deleteOne();

  return res.json({
    status: 'SUCCESS',
    message: 'Job deleted successfully'
  });
});

/**
 * Get applications for a specific job
 * GET /api/employers/jobs/:jobId/applications
 */
const getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Check ownership
  if (job.company.toString() !== req.user.companyId.toString()) {
    throw new ApiError(403, 'Not authorized to view applications');
  }

  const applications = await JobApplication.find({
    job: jobId,
    deletedAt: null,
  })
    .sort({ appliedAt: -1 })
    .lean();

  const formatted = applications.map((application) => {
    const personal = application.snapshot?.personal || {};
    const professional = application.snapshot?.professional || {};
    const documents = application.snapshot?.documents || {};
    const educationEntry = professional.education?.[0] || {};
    const experienceYears =
      typeof professional.totalExperience?.years === "number"
        ? professional.totalExperience.years
        : undefined;

    return {
      _id: application._id,
      applicantId: application.applicant,
      status: application.status,
      appliedAt: application.appliedAt,
      createdAt: application.createdAt,
      name: personal.name || "Applicant",
      avatarUrl: personal.avatarUrl,
      currentRole: professional.currentRole || "",
      experienceYears,
      education: educationEntry?.degree || "",
      cvUrl: documents.resumeUrl || "",
      summary: personal.headline,
    };
  });

  return res.json({
    status: 'SUCCESS',
    data: {
      jobTitle: job.title,
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
      },
      applications: formatted,
    },
  });
});

/**
 * Update application status
 * PATCH /api/employers/jobs/:jobId/applications/:appId
 */
const updateJobApplicationStatus = asyncHandler(async (req, res) => {
  const { jobId, appId } = req.params;
  const { status, notes } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Check ownership
  if (job.company.toString() !== req.user.companyId.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const application = await JobApplication.findOne({
    _id: appId,
    job: jobId,
    deletedAt: null,
  });

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (status) {
    if (!APPLICATION_STATUS_VALUES.includes(status)) {
      throw new ApiError(400, 'Invalid application status');
    }
    application.status = status;
  }

  if (notes) {
    application.timeline.push({
      event: status || application.status || 'note',
      notes,
      performedBy: req.user._id,
      date: new Date(),
    });
  }

  await application.save();

  return res.json({
    status: 'SUCCESS',
    data: {
      applicationId: application._id,
      status: application.status,
    },
  });
});

const formatNameFromPersonal = (personal = {}) => {
  const name = personal.name || `${personal.firstName || ""} ${personal.lastName || ""}`.trim();
  return name || "Candidate";
};

const formatCurrentRole = (personal = {}, professional = {}) => {
  return (
    personal.headline ||
    professional.currentRole ||
    professional.currentCompany ||
    (professional.preferredRoles?.[0] || "") ||
    ""
  );
};

const mapApplicationToCandidate = (application) => {
  const personal = application.snapshot?.personal || {};
  const professional = application.snapshot?.professional || {};
  const documents = application.snapshot?.documents || {};

  return {
    _id: application._id,
    applicantId: application.applicant,
    applicationId: application._id,
    name: formatNameFromPersonal(personal),
    avatarUrl: personal.avatarUrl || "",
    currentRole: formatCurrentRole(personal, professional),
    applyEmail: personal.email || "",
    appliedAt: application.appliedAt || application.createdAt,
    cvUrl: documents.resumeUrl || "",
    status: application.status || "saved",
    saved: Boolean(application.saved),
    source: "application",
  };
};

const mapSavedEntryToCandidate = (entry) => {
  const applicant = entry.applicant;
  if (!applicant) return null;

  const personal = applicant.personalInfo || {};
  const professional = applicant.jobPreferences || {};

  return {
    _id: entry._id,
    savedCandidateId: entry._id,
    applicantId: applicant._id,
    name: applicant.fullName || formatNameFromPersonal(personal),
    avatarUrl: personal.avatarUrl || "",
    currentRole: formatCurrentRole(personal, professional),
    applyEmail:
      applicant.contactInfo?.email || personal.email || "",
    appliedAt: entry.createdAt,
    cvUrl: applicant.documents?.resumeUrl || "",
    status: "saved",
    source: "manual",
  };
};

/**
 * Get saved candidates across all jobs
 * GET /api/employers/saved-candidates
 */
const getSavedCandidates = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(
      400,
      "No employer profile associated with this user. Please complete onboarding first."
    );
  }

  const [applications, savedEntries] = await Promise.all([
    JobApplication.find({
      company: companyId,
      deletedAt: null,
      saved: true,
    })
      .sort({ updatedAt: -1 })
      .lean(),
    SavedCandidate.find({
      company: companyId,
      deletedAt: null,
    })
      .populate(
        "applicant",
        "fullName personalInfo jobPreferences contactInfo documents"
      )
      .lean(),
  ]);

  const candidatesByApplicant = new Map();

  applications.forEach((application) => {
    const key = application.applicant?.toString() || application._id.toString();
    candidatesByApplicant.set(key, mapApplicationToCandidate(application));
  });

  savedEntries.forEach((entry) => {
    if (!entry?.applicant) return;
    const key = entry.applicant._id.toString();
    if (candidatesByApplicant.has(key)) return;
    const candidate = mapSavedEntryToCandidate(entry);
    if (candidate) {
      candidatesByApplicant.set(key, candidate);
    }
  });

  return res.json({
    status: "SUCCESS",
    data: Array.from(candidatesByApplicant.values()),
  });
});

const saveCandidate = asyncHandler(async (req, res) => {
  const { applicantId } = req.body;
  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(
      400,
      "No employer profile associated with this user. Please complete onboarding first."
    );
  }

  if (!applicantId) {
    throw new ApiError(400, "Applicant ID is required");
  }

  const applicant = await Applicant.findById(applicantId);
  if (!applicant) {
    throw new ApiError(404, "Applicant not found");
  }

  const existing = await SavedCandidate.findOne({
    company: companyId,
    applicant: applicantId,
    deletedAt: null,
  });

  if (existing) {
    return res.json({
      status: "SUCCESS",
      data: {
        savedCandidateId: existing._id,
        applicantId,
        alreadySaved: true,
      },
    });
  }

  const savedCandidate = await SavedCandidate.create({
    company: companyId,
    applicant: applicantId,
    createdBy: req.user._id,
  });

  return res.json({
    status: "SUCCESS",
    data: {
      savedCandidateId: savedCandidate._id,
      applicantId,
      alreadySaved: false,
    },
  });
});

const removeSavedCandidate = asyncHandler(async (req, res) => {
  const { applicantId } = req.params;
  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(
      400,
      "No employer profile associated with this user. Please complete onboarding first."
    );
  }

  if (!applicantId) {
    throw new ApiError(400, "Applicant ID is required");
  }

  const entry = await SavedCandidate.findOneAndUpdate(
    {
      company: companyId,
      applicant: applicantId,
      deletedAt: null,
    },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!entry) {
    throw new ApiError(404, "Saved candidate not found");
  }

  return res.json({
    status: "SUCCESS",
    data: {
      applicantId,
      removed: true,
    },
  });
});

/**
 * Toggle saved status for candidate
 * PATCH /api/employers/applications/:appId/saved
 */
const toggleSavedCandidate = asyncHandler(async (req, res) => {
  const { appId } = req.params;

  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(
      400,
      'No employer profile associated with this user. Please complete onboarding first.'
    );
  }

  const application = await JobApplication.findOne({
    _id: appId,
    company: companyId,
    deletedAt: null,
  });

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  application.saved = !application.saved;
  await application.save();

  return res.json({
    status: 'SUCCESS',
    data: {
      applicationId: application._id,
      saved: application.saved,
    },
  });
});

const getEmployerDashboardStats = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  if (!companyId) {
    throw new ApiError(
      400,
      "No employer profile associated with this user. Please complete onboarding first."
    );
  }

  const jobFilter = {
    company: companyId,
    $or: [
      { deletedAt: null },
      { deletedAt: { $exists: false } },
    ],
  };

  const [jobCount, savedApps, savedEntries, recentJobs] = await Promise.all([
    Job.countDocuments(jobFilter),
    JobApplication.find({
      company: companyId,
      deletedAt: null,
      saved: true,
    }).distinct("applicant"),
    SavedCandidate.find({
      company: companyId,
      deletedAt: null,
    }).distinct("applicant"),
    Job.find(jobFilter)
      .sort({ postedDate: -1 })
      .limit(3)
      .select("title status postedDate applicationCount")
      .lean(),
  ]);

  const uniqueSaved = new Set([
    ...savedApps.filter(Boolean),
    ...savedEntries.filter(Boolean),
  ]).size;

  res.json({
    status: "SUCCESS",
    data: {
      jobCount,
      savedCandidates: uniqueSaved,
      recentJobs: recentJobs.map((job) => ({
        id: job._id,
        title: job.title,
        status: job.status,
        postedAt: job.postedDate,
        applications: job.applicationCount || 0,
      })),
    },
  });
});

/**
 * Public: List active jobs
 * GET /api/jobs
 */
const listPublicJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    jobType,
    experienceLevel,
    remote,
    page = 1,
    limit = 20
  } = req.query;

  const query = { status: 'active' };
  const conditions = [];

  if (search) {
    const regex = new RegExp(search, 'i');
    conditions.push({
      $or: [
        { title: regex },
        { description: regex },
        { summary: regex },
        { keywords: regex }
      ]
    });
  }

  if (location) {
    const regex = new RegExp(location, 'i');
    conditions.push({
      $or: [
        { 'address.city': regex },
        { 'address.state': regex },
        { 'address.country': regex }
      ]
    });
  }

  if (conditions.length) {
    query.$and = conditions;
  }

  if (jobType) {
    query.employmentType = jobType;
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  if (remote === 'true') {
    query.workLocationType = 'Remote';
  }

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (pageNumber - 1) * pageSize;

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate(
        'company',
        'companyName name avatarUrl bannerImageUrl industry teamSize headquarters location media.logoVariants websiteUrl description socialLinks'
      )
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(pageSize),
    Job.countDocuments(query)
  ]);

  return res.json({
    status: 'SUCCESS',
    data: {
      jobs: jobs.map(serializeJobForList),
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    }
  });
});

/**
 * Public: Job detail
 * GET /api/jobs/:jobId
 */
const getPublicJobDetails = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findOne({
    _id: jobId,
    status: 'active'
  }).populate(
    'company',
    'companyName name avatarUrl bannerImageUrl industry teamSize headquarters location media.logoVariants websiteUrl description socialLinks'
  );

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  job.views = (job.views || 0) + 1;
  await job.save();

  return res.json({
    status: 'SUCCESS',
    data: serializeJobForDetail(job)
  });
});

module.exports = {
  createJob,
  updateJob,
  getCompanyJobs,
  getJob,
  deleteJob,
  getJobApplications,
  updateJobApplicationStatus,
  getSavedCandidates,
  toggleSavedCandidate,
  saveCandidate,
  removeSavedCandidate,
  getEmployerDashboardStats,
  listPublicJobs,
  getPublicJobDetails,
};
