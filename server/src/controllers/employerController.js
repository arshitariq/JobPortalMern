// server/controllers/employerController.js
const Employer = require("../models/Employer");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { employerProfileSchema } = require("../utils/validation");
const { getFileUrl } = require("../services/uploadService");

const ensureEmployerRole = (user) => {
  if (!user || user.role !== "employer") {
    throw new ApiError(403, "Only employers can access this resource");
  }
};

/**
 * ✅ Frontend ko onboarding wali keys return karwao (same as your RHF form)
 * - companyName, about, logoUrl, bannerUrl ...
 * - plus settings page also can use these
 */
const mapEmployerToResponse = (doc) => {
  if (!doc) return null;

  return {
    id: doc._id,
    userId: doc.userId,

    // step 1
    companyName: doc.companyName || "",
    about: doc.description || "",
    logoUrl: doc.avatarUrl || "",
    bannerUrl: doc.bannerImageUrl || "",

    // step 2
    organizationType: doc.organizationType || "",
    industryType: doc.industry || "",
    teamSize: doc.teamSize || "",
    yearOfEstablishment: doc.yearOfEstablishment || "",
    websiteUrl: doc.websiteUrl || "",
    companyVision: doc.companyVision || "",

    // step 3
    socialLinks: doc.socialLinks || [],

    // step 4
    mapLocation: doc.mapLocation || "",
    phone: doc.phone || "",
    contactEmail: doc.contactEmail || "",

    // extra
    location: doc.location || "",

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const mapEmployerListItem = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id,
    userId: doc.userId,
    name: doc.companyName || "Company",
    location: doc.location || doc.mapLocation || "",
    logoUrl: doc.avatarUrl || "",
    bannerUrl: doc.bannerImageUrl || "",
    industry: doc.industry || "",
    teamSize: doc.teamSize || "",
    featured: Boolean(doc.isFeatured),
    openPositions: doc.metrics?.activeJobs || 0,
    websiteUrl: doc.websiteUrl || "",
    createdAt: doc.createdAt,
  };
};

/**
 * GET /api/employers/me
 */
const getMyProfile = asyncHandler(async (req, res) => {
  ensureEmployerRole(req.user);

  const employer = await Employer.findOne({ userId: req.user._id });

  return res.status(200).json({
    status: "SUCCESS",
    data: mapEmployerToResponse(employer),
  });
});

/**
 * ✅ SETTINGS PAGE (Strict Validation)
 * PUT /api/employers/me
 * - yahan aapka existing employerProfileSchema use hoga
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  ensureEmployerRole(req.user);

  const validation = employerProfileSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, validation.error.issues[0].message);
  }

  const payload = validation.data;

  const update = {
    companyName: payload.name,
    description: payload.description,
    organizationType: payload.organizationType,
    teamSize: payload.teamSize,
    yearOfEstablishment: Number(payload.yearOfEstablishment),
    websiteUrl: payload.websiteUrl || "",
    location: payload.location || "",
  };

  const employer = await Employer.findOneAndUpdate(
    { userId: req.user._id },
    { $set: update, $setOnInsert: { userId: req.user._id } },
    { new: true, upsert: true }
  );

  return res.status(200).json({
    status: "SUCCESS",
    message: "Employer profile updated",
    data: mapEmployerToResponse(employer),
  });
});

/**
 * ✅ ONBOARDING WIZARD (Partial Save)
 * PATCH /api/employers/onboarding
 */
const updateMyOnboarding = asyncHandler(async (req, res) => {
  ensureEmployerRole(req.user);

  const payload = req.body || {};
  const update = {};

  // Step 1 mapping
  if (payload.companyName !== undefined) update.companyName = payload.companyName;
  if (payload.about !== undefined) update.description = payload.about;
  if (payload.logoUrl !== undefined) update.avatarUrl = payload.logoUrl;
  if (payload.bannerUrl !== undefined) update.bannerImageUrl = payload.bannerUrl;

  // Step 2 mapping
  if (payload.organizationType !== undefined) update.organizationType = payload.organizationType;
  if (payload.industryType !== undefined) update.industry = payload.industryType;
  if (payload.teamSize !== undefined) update.teamSize = payload.teamSize;

  if (payload.yearOfEstablishment !== undefined) {
    const y = Number(payload.yearOfEstablishment);
    if (!Number.isNaN(y)) update.yearOfEstablishment = y;
  }

  if (payload.websiteUrl !== undefined) update.websiteUrl = payload.websiteUrl;
  if (payload.companyVision !== undefined) update.companyVision = payload.companyVision;

  // Step 3
  if (payload.socialLinks !== undefined) update.socialLinks = payload.socialLinks;

  // Step 4
  if (payload.mapLocation !== undefined) {
    update.mapLocation = payload.mapLocation;
    update.location = payload.mapLocation;
  }
  if (payload.phone !== undefined) update.phone = payload.phone;
  if (payload.contactEmail !== undefined) update.contactEmail = payload.contactEmail;

  const employer = await Employer.findOneAndUpdate(
    { userId: req.user._id },
    { $set: update, $setOnInsert: { userId: req.user._id } },
    { new: true, upsert: true }
  );

  return res.status(200).json({
    status: "SUCCESS",
    message: "Employer onboarding saved",
    data: mapEmployerToResponse(employer),
  });
});

/**
 * バ. Upload employer media (logo/banner)
 * POST /api/employers/me/upload
 */
const uploadEmployerMedia = asyncHandler(async (req, res) => {
  ensureEmployerRole(req.user);

  const files = req.files || {};
  const update = {};
  const data = {};

  if (files.logo && files.logo[0]) {
    const file = files.logo[0];
    const logoUrl = getFileUrl(file.filename);
    update.avatarUrl = logoUrl;
    data.logoUrl = logoUrl;
  }

  if (files.banner && files.banner[0]) {
    const file = files.banner[0];
    const bannerUrl = getFileUrl(file.filename);
    update.bannerImageUrl = bannerUrl;
    data.bannerUrl = bannerUrl;
  }

  if (!Object.keys(update).length) {
    throw new ApiError(400, "No files uploaded");
  }

  await Employer.findOneAndUpdate(
    { userId: req.user._id },
    { $set: update, $setOnInsert: { userId: req.user._id } },
    { new: true, upsert: true }
  );

  return res.status(200).json({
    status: "SUCCESS",
    message: "Files uploaded",
    data,
  });
});

/**
 * PUBLIC: List employers for discovery
 * GET /api/employers/explore
 */
const listPublicEmployers = asyncHandler(async (req, res) => {
  const {
    q = "",
    location = "",
    page = 1,
    limit = 12,
  } = req.query;

  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

  const filters = [
    { deletedAt: null },
    { isActive: true },
  ];

  const keyword = q.trim();
  if (keyword) {
    const regex = new RegExp(keyword, "i");
    filters.push({
      $or: [
        { companyName: regex },
        { description: regex },
        { industry: regex },
        { keywords: regex },
        { searchTags: regex },
      ],
    });
  }

  const locationTerm = location.trim();
  if (locationTerm) {
    const regex = new RegExp(locationTerm, "i");
    filters.push({
      $or: [
        { location: regex },
        { mapLocation: regex },
        { "headquarters.city": regex },
        { "headquarters.country": regex },
      ],
    });
  }

  const query =
    filters.length > 0 ? { $and: filters } : {};

  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    Employer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Employer.countDocuments(query),
  ]);

  res.status(200).json({
    status: "SUCCESS",
    data: {
      results: items.map(mapEmployerListItem),
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
      },
    },
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMyOnboarding,
  uploadEmployerMedia,
  listPublicEmployers,
};
