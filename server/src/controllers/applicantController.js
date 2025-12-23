// server/controllers/applicantController.js

const Applicant = require("../models/Applicant");
const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const JobFavorite = require("../models/JobFavorite");
const Employer = require("../models/Employer");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getFileUrl } = require("../services/uploadService");

/* ==============================
   HELPERS
================================ */

const ensureApplicantRole = (user) => {
  if (!user || user.role !== "applicant") {
    throw new ApiError(403, "Only applicants can access this resource");
  }
};

const formatLocation = (value = {}) => {
  if (typeof value === "string") {
    return value;
  }

  const parts = [value.city, value.state, value.country]
    .filter(Boolean)
    .map((part) => part.trim());

  return parts.join(", ");
};

const mapApplicantToResponse = (doc) => {
  if (!doc) return null;

  const address = doc.contactInfo?.address || {};
  const location = formatLocation(address) || doc.location || "";
  const educationEntry = doc.education?.[0];
  const educationValue =
    doc.highestEducation?.degree ||
    educationEntry?.degree ||
    "";
  const experienceSummary =
    doc.jobPreferences?.experienceLevel ||
    (typeof doc.totalExperience?.years === "number"
      ? `${doc.totalExperience.years}+ years experience`
      : "");
  const skills = Array.isArray(doc.skills)
    ? doc.skills
        .map((skill) =>
          typeof skill === "string" ? skill : skill?.name
        )
        .filter(Boolean)
    : [];
  const socialLinks = Array.isArray(doc.socialLinks)
    ? doc.socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
      }))
    : [];
  const preferredRole =
    doc.jobPreferences?.preferredRoles?.[0] ||
    doc.jobAlerts?.[0]?.keywords?.[0] ||
    "";
  const preferredLocation = doc.jobPreferences?.locations?.[0]
    ? formatLocation(doc.jobPreferences.locations[0])
    : doc.jobAlerts?.[0]?.locations?.[0] || "";

  return {
    id: doc._id,
    userId: doc.userId,
    fullName:
      doc.fullName ||
      `${doc.personalInfo?.firstName || ""} ${
        doc.personalInfo?.lastName || ""
      }`.trim(),
    headline: doc.personalInfo?.headline || "",
    avatarUrl: doc.personalInfo?.avatarUrl || "",
    bannerUrl: doc.personalInfo?.bannerUrl || "",
    biography: doc.summary || "",
    education: educationValue,
    experience: experienceSummary,
    location,
    mapLocation: location,
    contactEmail: doc.contactInfo?.email || "",
    phone: doc.contactInfo?.phone || "",
    websiteUrl: doc.portfolio?.website || "",
    resumeUrl: doc.documents?.resumeUrl || "",
    skills,
    socialLinks,
    gender: doc.personalInfo?.gender || "",
    nationality: doc.personalInfo?.nationality || "",
    maritalStatus: doc.personalInfo?.maritalStatus || "",
    dateOfBirth: doc.personalInfo?.dateOfBirth || null,
    alertRole: preferredRole,
    alertLocation: preferredLocation,
    notifyShortlisted: Boolean(doc.notifications?.shortlisted),
    notifySavedProfile: Boolean(doc.notifications?.savedProfile),
    notifyAppliedExpired: Boolean(doc.notifications?.appliedExpired),
    notifyRejected: Boolean(doc.notifications?.rejected),
    notifyJobAlertLimit: Boolean(doc.notifications?.jobAlertLimit),
    profilePublic: doc.privacySettings?.profileVisibility !== "private",
    resumePublic: doc.privacySettings?.resumeVisibility === "public",
    profileCompleteness: doc.profileCompleteness?.percentage || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

/* ==============================
   SEARCH PUBLIC APPLICANTS
================================ */

const searchPublicApplicants = asyncHandler(async (req, res) => {
  const { q, location, skills, experience, page = 1, limit = 10 } = req.query;

  const query = {
    deletedAt: null,
    "privacySettings.profileVisibility": "public",
  };

  // Search by keyword in headline and summary
  if (q) {
    query.$text = { $search: q };
  }

  // Filter by location
  if (location) {
    query["contactInfo.address.city"] = new RegExp(location, "i");
  }

  // Filter by skills
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : skills.split(",");
    query["skills.name"] = { $in: skillsArray.map(s => new RegExp(s, "i")) };
  }

  // Filter by experience
  if (experience) {
    query["totalExperience.years"] = { $gte: parseInt(experience) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [applicants, total] = await Promise.all([
    Applicant.find(query)
      .select("personalInfo summary skills contactInfo.address totalExperience documents.resumeUrl")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ "metrics.profileStrength": -1 }),
    Applicant.countDocuments(query),
  ]);

  res.status(200).json({
    status: "SUCCESS",
    data: {
      applicants: applicants.map(mapApplicantToResponse),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/* ==============================
   GET MY PROFILE
================================ */

const getMyProfile = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  const applicant = await Applicant.findOne({ userId: req.user._id });

  return res.status(200).json({
    status: "SUCCESS",
    data: mapApplicantToResponse(applicant),
  });
});

/* ==============================
   UPDATE MY PROFILE (SAFE)
================================ */

const updateMyProfile = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  const payload = req.body || {};

  let applicant = await Applicant.findOne({ userId: req.user._id });

  if (!applicant) {
    applicant = new Applicant({
      userId: req.user._id,
    });
  }

  applicant.personalInfo = applicant.personalInfo || {};
  applicant.contactInfo = applicant.contactInfo || {};
  applicant.contactInfo.address = applicant.contactInfo.address || {};
  applicant.portfolio = applicant.portfolio || {};
  applicant.documents = applicant.documents || {};
  applicant.jobPreferences = applicant.jobPreferences || {};
  applicant.notifications = applicant.notifications || {};
  applicant.privacySettings = applicant.privacySettings || {};

  /* -------- BASIC INFO -------- */
  if (payload.fullName) {
    const parts = payload.fullName.trim().split(/\s+/);
    applicant.personalInfo.firstName =
      parts.shift() || applicant.personalInfo.firstName;
    applicant.personalInfo.lastName =
      parts.join(" ") || applicant.personalInfo.lastName;
  }

  if (payload.firstName) {
    applicant.personalInfo.firstName = payload.firstName;
  }

  if (payload.lastName) {
    applicant.personalInfo.lastName = payload.lastName;
  }

  if (payload.headline !== undefined) {
    applicant.personalInfo.headline =
      payload.headline ?? applicant.personalInfo.headline;
  }

  if (payload.gender !== undefined) {
    applicant.personalInfo.gender = payload.gender || "";
  }

  if (payload.maritalStatus !== undefined) {
    applicant.personalInfo.maritalStatus = payload.maritalStatus || "";
  }

  if (payload.nationality !== undefined) {
    applicant.personalInfo.nationality = payload.nationality || "";
  }

  if (payload.dateOfBirth) {
    applicant.personalInfo.dateOfBirth = new Date(payload.dateOfBirth);
  }

  if (payload.biography !== undefined) {
    applicant.summary = payload.biography || "";
  }

  /* -------- EDUCATION -------- */
  if (payload.education) {
    const educationValue = payload.education;
    const isObject =
      typeof educationValue === "object" && educationValue !== null;
    const degree = isObject
      ? educationValue.degree || ""
      : String(educationValue);
    const institution = isObject
      ? educationValue.institution || "Not specified"
      : "Not specified";

    applicant.education = [
      {
        degree,
        institution,
        fieldOfStudy: isObject ? educationValue.fieldOfStudy || "" : "",
        startDate: isObject ? educationValue.startDate || new Date() : new Date(),
        current: true,
      },
    ];

    applicant.highestEducation = {
      degree,
      institution,
    };
  }

  if (payload.experience !== undefined) {
    applicant.jobPreferences.experienceLevel = payload.experience || "";
  }

  /* -------- SKILLS -------- */
  if (payload.skills) {
    const skillsArray = Array.isArray(payload.skills)
      ? payload.skills
      : [payload.skills];

    applicant.skills = skillsArray
      .filter(Boolean)
      .map((skill) =>
        typeof skill === "string"
          ? {
              name: skill,
              level: "intermediate",
              category: "technical",
            }
          : {
              name: skill.name,
              level: skill.level || "intermediate",
              category: skill.category || "technical",
            }
      );
  }

  if (Array.isArray(payload.socialLinks)) {
    applicant.socialLinks = payload.socialLinks.filter(
      (link) => link.platform && link.url
    );
  }

  /* -------- CONTACT -------- */
  if (payload.contactEmail !== undefined) {
    applicant.contactInfo.email = payload.contactEmail || "";
  }

  if (payload.phone !== undefined) {
    applicant.contactInfo.phone = payload.phone || "";
  }

  const locationValue = payload.mapLocation || payload.location;
  if (locationValue) {
    const parts = locationValue.split(",").map((part) => part.trim());
    const city = parts[0];
    const country = parts.length > 1 ? parts[parts.length - 1] : "";

    applicant.contactInfo.address = {
      ...applicant.contactInfo.address,
      city: city || applicant.contactInfo.address.city,
      country: country || applicant.contactInfo.address.country,
    };
  }

  /* -------- WEB & RESUME -------- */
  if (payload.websiteUrl !== undefined) {
    applicant.portfolio.website = payload.websiteUrl || "";
  }

  if (payload.resumeUrl) {
    applicant.documents = {
      ...applicant.documents,
      resumeUrl: payload.resumeUrl,
      resumeLastUpdated: new Date(),
    };
  }

  /* -------- PREFERENCES -------- */
  if (payload.alertRole !== undefined) {
    applicant.jobPreferences.preferredRoles = payload.alertRole
      ? [payload.alertRole]
      : [];
  }

  if (payload.alertLocation !== undefined) {
    if (payload.alertLocation) {
      const parts = payload.alertLocation.split(",").map((part) => part.trim());
      applicant.jobPreferences.locations = [
        {
          city: parts[0] || payload.alertLocation,
          country:
            parts.length > 1
              ? parts[parts.length - 1]
              : applicant.contactInfo.address.country,
          type: "hybrid",
        },
      ];
    } else {
      applicant.jobPreferences.locations = [];
    }
  }

  if (typeof payload.profilePublic === "boolean") {
    applicant.privacySettings.profileVisibility = payload.profilePublic
      ? "public"
      : "private";
  }

  if (typeof payload.resumePublic === "boolean") {
    applicant.privacySettings.resumeVisibility = payload.resumePublic
      ? "public"
      : "private";
  }

  if (typeof payload.notifyShortlisted === "boolean") {
    applicant.notifications.shortlisted = payload.notifyShortlisted;
  }

  if (typeof payload.notifySavedProfile === "boolean") {
    applicant.notifications.savedProfile = payload.notifySavedProfile;
  }

  if (typeof payload.notifyAppliedExpired === "boolean") {
    applicant.notifications.appliedExpired = payload.notifyAppliedExpired;
  }

  if (typeof payload.notifyRejected === "boolean") {
    applicant.notifications.rejected = payload.notifyRejected;
  }

  if (typeof payload.notifyJobAlertLimit === "boolean") {
    applicant.notifications.jobAlertLimit = payload.notifyJobAlertLimit;
  }

  /* -------- CALCULATIONS -------- */
  applicant.calculateProfileCompleteness();

  await applicant.save();

  return res.status(200).json({
    status: "SUCCESS",
    message: "Profile updated successfully",
    data: mapApplicantToResponse(applicant),
  });
});

/* ==============================
   UPLOAD RESUME
================================ */

const uploadResume = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  if (!req.file) {
    throw new ApiError(400, "No resume uploaded");
  }

  const resumeUrl = getFileUrl(req.file.filename);

  let applicant = await Applicant.findOne({ userId: req.user._id });

  if (!applicant) {
    applicant = new Applicant({ userId: req.user._id });
  }

  applicant.documents = {
    ...applicant.documents,
    resumeUrl,
    resumeLastUpdated: new Date(),
  };

  await applicant.save();

  res.status(200).json({
    status: "SUCCESS",
    data: { resumeUrl },
  });
});

/* ==============================
   UPLOAD APPLICANT MEDIA
================================ */

const uploadApplicantMedia = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  if (!req.files || Object.keys(req.files).length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  let applicant = await Applicant.findOne({ userId: req.user._id });

  if (!applicant) {
    applicant = new Applicant({ userId: req.user._id });
  }

  const uploadedFiles = {};

  // Handle avatar
  if (req.files.avatar && req.files.avatar[0]) {
    const avatarUrl = getFileUrl(req.files.avatar[0].filename);
    if (!applicant.personalInfo) applicant.personalInfo = {};
    applicant.personalInfo.avatarUrl = avatarUrl;
    uploadedFiles.avatarUrl = avatarUrl;
  }

  // Handle banner
  if (req.files.banner && req.files.banner[0]) {
    const bannerUrl = getFileUrl(req.files.banner[0].filename);
    if (!applicant.personalInfo) applicant.personalInfo = {};
    applicant.personalInfo.bannerUrl = bannerUrl;
    uploadedFiles.bannerUrl = bannerUrl;
  }

  // Handle resume
  if (req.files.resume && req.files.resume[0]) {
    const resumeUrl = getFileUrl(req.files.resume[0].filename);
    applicant.documents = {
      ...applicant.documents,
      resumeUrl,
      resumeLastUpdated: new Date(),
    };
    uploadedFiles.resumeUrl = resumeUrl;
  }

  applicant.calculateProfileCompleteness();
  await applicant.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Files uploaded successfully",
    data: uploadedFiles,
  });
});

/* ==============================
   GET MY APPLICATIONS
================================ */

const getMyApplications = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  const { status, page = 1, limit = 10 } = req.query;

  const query = {
    applicant: req.user._id,
  };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [applications, total] = await Promise.all([
    JobApplication.find(query)
      .populate("job", "title company location jobType salaryRange postedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    JobApplication.countDocuments(query),
  ]);

  res.status(200).json({
    status: "SUCCESS",
    data: {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/* ==============================
   GET MY FAVORITES
================================ */

const getMyFavorites = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [favorites, total] = await Promise.all([
    JobFavorite.find({ applicant: req.user._id })
      .populate("job", "title company location jobType salaryRange postedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    JobFavorite.countDocuments({ applicant: req.user._id }),
  ]);

  res.status(200).json({
    status: "SUCCESS",
    data: {
      favorites: favorites.map((fav) => fav.job),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/* ==============================
   APPLY TO JOB
================================ */

const applyToJob = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const employer = await Employer.findById(job.company);
  if (employer?.userId?.toString() === req.user._id?.toString()) {
    throw new ApiError(403, "Employers cannot apply to their own jobs");
  }

  const applicant = await Applicant.findOne({ userId: req.user._id });
  if (!applicant) {
    throw new ApiError(400, "Complete your profile first");
  }

  const alreadyApplied = await JobApplication.findOne({
    job: jobId,
    applicant: req.user._id,
  });

  if (alreadyApplied) {
    throw new ApiError(400, "Already applied");
  }

  const applicantName =
    applicant.fullName ||
    `${applicant.personalInfo?.firstName || ""} ${
      applicant.personalInfo?.lastName || ""
    }`.trim() ||
    applicant.personalInfo?.headline ||
    "Applicant";

  const applicantLocation =
    formatLocation(applicant.contactInfo?.address) ||
    applicant.location ||
    "";

  const snapshot = {
    personal: {
      name: applicantName,
      email: applicant.contactInfo?.email || req.user.email || "",
      phone: applicant.contactInfo?.phone || "",
      location: applicantLocation,
      avatarUrl: applicant.personalInfo?.avatarUrl || "",
      headline: applicant.personalInfo?.headline || "",
    },
    professional: {
      currentRole: applicant.personalInfo?.headline || "",
      currentCompany: applicant.currentCompany || "",
      totalExperience: applicant.totalExperience || {},
      education: applicant.education || [],
      skills: applicant.skills || [],
    },
    documents: {
      resumeUrl: applicant.documents?.resumeUrl || "",
      coverLetter: applicant.documents?.coverLetter || {},
    },
  };

  const application = await JobApplication.create({
    job: jobId,
    applicant: req.user._id,
    company: job.company,
    snapshot,
    metrics: {
      applicationSource: "direct",
      referral: {},
    },
  });

  await Job.updateOne(
    { _id: job._id },
    { $inc: { applicationCount: 1 } }
  );

  res.status(201).json({
    status: "SUCCESS",
    data: {
      id: application._id,
      hasApplied: true,
    },
  });
});

/* ==============================
   GET JOB ENGAGEMENT
================================ */

const getJobEngagement = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  const { jobId } = req.params;

  const [application, favorite] = await Promise.all([
    JobApplication.findOne({
      job: jobId,
      applicant: req.user._id,
    }).select("status createdAt"),
    JobFavorite.findOne({
      job: jobId,
      applicant: req.user._id,
    }),
  ]);

  res.status(200).json({
    status: "SUCCESS",
    data: {
      hasApplied: !!application,
      applicationStatus: application?.status || null,
      appliedAt: application?.createdAt || null,
      isFavorite: !!favorite,
    },
  });
});

/* ==============================
   FAVORITES
================================ */

const toggleFavoriteJob = asyncHandler(async (req, res) => {
  ensureApplicantRole(req.user);

  const { jobId } = req.params;

  const existing = await JobFavorite.findOne({
    applicant: req.user._id,
    job: jobId,
  });

  if (existing) {
    await JobFavorite.deleteOne({ _id: existing._id });
    return res.json({ status: "SUCCESS", liked: false });
  }

  await JobFavorite.create({
    applicant: req.user._id,
    job: jobId,
  });

  res.json({ status: "SUCCESS", liked: true });
});

/* ==============================
   EXPORTS
================================ */

module.exports = {
  searchPublicApplicants,
  getMyProfile,
  updateMyProfile,
  uploadResume,
  uploadApplicantMedia,
  getMyApplications,
  getMyFavorites,
  toggleFavoriteJob,
  applyToJob,
  getJobEngagement,
};
