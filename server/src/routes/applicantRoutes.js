// server/routes/applicantRoutes.js
const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { uploadSingle, uploadFields } = require("../middleware/uploadMiddleware");

const {
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
} = require("../controllers/applicantController");

// public directory
router.get("/", searchPublicApplicants);

// profile
router.get("/me", requireAuth, requireRole("applicant"), getMyProfile);

router.put("/me", requireAuth, requireRole("applicant"), updateMyProfile);

router.post(
  "/me/upload",
  requireAuth,
  requireRole("applicant"),
  uploadFields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  uploadApplicantMedia
);

// resume upload
router.post(
  "/me/resume",
  requireAuth,
  requireRole("applicant"),
  uploadSingle("resume"),
  uploadResume
);

// applied jobs
router.get(
  "/applications",
  requireAuth,
  requireRole("applicant"),
  getMyApplications
);

// job engagement + apply
router.get(
  "/jobs/:jobId/engagement",
  requireAuth,
  requireRole("applicant"),
  getJobEngagement
);

router.post(
  "/jobs/:jobId/apply",
  requireAuth,
  requireRole("applicant"),
  applyToJob
);

// favorites
router.get(
  "/favorites",
  requireAuth,
  requireRole("applicant"),
  getMyFavorites
);

router.post(
  "/favorites/:jobId/toggle",
  requireAuth,
  requireRole("applicant"),
  toggleFavoriteJob
);

module.exports = router;