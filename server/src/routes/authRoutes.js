const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");
const { optionalUploadSingle } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public
router.post(
  "/register",
  optionalUploadSingle("profileImage"),
  authController.register
);
router.post("/login", authController.login);

// NEW
router.post("/forgot-password", authController.forgotPasswordController);
router.post("/reset-password", authController.resetPasswordController);
router.get("/verify-email", authController.verifyEmailController);
router.post("/resend-verification", authController.resendVerificationController);

// Public-ish (detect session if cookie present)
router.get("/me", optionalAuth, authController.getCurrentUser);

// Protected
router.use(requireAuth);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshSession);

module.exports = router;
