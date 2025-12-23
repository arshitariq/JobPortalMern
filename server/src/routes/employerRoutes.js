// server/routes/employerRoutes.js
const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { uploadFields } = require("../middleware/uploadMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  updateMyOnboarding,
  uploadEmployerMedia,
  listPublicEmployers,
} = require("../controllers/employerController");

const {
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
} = require("../controllers/jobController");

// =====================
// PUBLIC EMPLOYERS LISTING
// =====================

router.get("/explore", listPublicEmployers);

// =====================
// EMPLOYER PROFILE ROUTES
// =====================

router.get("/me", requireAuth, requireRole("employer"), getMyProfile);

router.put("/me", requireAuth, requireRole("employer"), updateMyProfile);

router.patch(
  "/onboarding",
  requireAuth,
  requireRole("employer"),
  updateMyOnboarding
);

router.post(
  "/me/upload",
  requireAuth,
  requireRole("employer"),
  uploadFields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  uploadEmployerMedia
);

// =====================
// JOB ROUTES (employer)
// =====================

// Create job
router.post(
  "/jobs",
  requireAuth,
  requireRole("employer"),
  createJob
);

// Get all jobs for current employer
router.get(
  "/jobs",
  requireAuth,
  requireRole("employer"),
  getCompanyJobs
);

// Get single job
router.get(
  "/jobs/:jobId",
  requireAuth,
  requireRole("employer"),
  getJob
);

// Update job
router.put(
  "/jobs/:jobId",
  requireAuth,
  requireRole("employer"),
  updateJob
);

// Delete job
router.delete(
  "/jobs/:jobId",
  requireAuth,
  requireRole("employer"),
  deleteJob
);

// =============================
// JOB APPLICATION ROUTES
// =============================

// List all applications for one job
router.get(
  "/jobs/:jobId/applications",
  requireAuth,
  requireRole("employer"),
  getJobApplications
);

// Update application status
router.patch(
  "/jobs/:jobId/applications/:appId",
  requireAuth,
  requireRole("employer"),
  updateJobApplicationStatus
);

// =============================
// SAVED CANDIDATES ROUTES
// =============================

// List saved candidates across all jobs
router.get(
  "/saved-candidates",
  requireAuth,
  requireRole("employer"),
  getSavedCandidates
);

router.post(
  "/saved-candidates",
  requireAuth,
  requireRole("employer"),
  saveCandidate
);

router.delete(
  "/saved-candidates/:applicantId",
  requireAuth,
  requireRole("employer"),
  removeSavedCandidate
);

// Toggle saved flag for one application
router.patch(
  "/applications/:appId/saved",
  requireAuth,
  requireRole("employer"),
  toggleSavedCandidate
);

router.get(
  "/dashboard",
  requireAuth,
  requireRole("employer"),
  getEmployerDashboardStats
);

module.exports = router;
