const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../services/authService");

const {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} = require("../utils/validation");

const { invalidateSession } = require("../services/sessionService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

/**
 * REGISTER
 */
const register = asyncHandler(async (req, res) => {
  const validation = registerUserSchema.safeParse(req.body);

  if (!validation.success) {
    throw new ApiError(400, validation.error.issues[0].message);
  }

  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.ip || "0.0.0.0";
  const profileImage = req.file ? req.file.filename : null;

  const result = await registerUser(
    validation.data,
    userAgent,
    ip,
    profileImage,
    res
  );

  return res.status(201).json(result);
});

/**
 * LOGIN
 */
const login = asyncHandler(async (req, res) => {
  const validation = loginUserSchema.safeParse(req.body);

  if (!validation.success) {
    throw new ApiError(400, validation.error.issues[0].message);
  }

  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.ip || "0.0.0.0";

  const result = await loginUser(validation.data, userAgent, ip, res);

  return res.status(200).json(result);
});

/**
 * LOGOUT
 */
const logout = asyncHandler(async (req, res) => {
  const sessionToken = req.cookies.session;

  if (sessionToken && req.session) {
    await invalidateSession(req.session.id);
  }

  res.clearCookie("session");

  return res.status(200).json({
    status: "SUCCESS",
    message: "Logged out successfully",
  });
});

/**
 * GET CURRENT USER
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(200).json({
      status: "SUCCESS",
      data: {
        user: null,
      },
    });
  }

  return res.status(200).json({
    status: "SUCCESS",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        userName: req.user.userName,
        email: req.user.email,
        role: req.user.role,
        phoneNumber: req.user.phoneNumber,
        profileImage: req.user.profileImage,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt,
      },
    },
  });
});

/**
 * REFRESH SESSION
 * (Session refresh is already handled in validateSessionAndGetUser,
 * this endpoint can be used by frontend to "touch" session)
 */
const refreshSession = asyncHandler(async (req, res) => {
  return res.status(200).json({
    status: "SUCCESS",
    message: "Session refreshed",
  });
});

/**
 * FORGOT PASSWORD (Send reset link)
 */
const forgotPasswordController = asyncHandler(async (req, res) => {
  const validation = forgotPasswordSchema.safeParse(req.body);

  if (!validation.success) {
    throw new ApiError(400, validation.error.issues[0].message);
  }

  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.ip || "0.0.0.0";

  const result = await forgotPassword(validation.data.email, { userAgent, ip });

  return res.status(200).json(result);
});

/**
 * RESET PASSWORD (Using token)
 */
const resetPasswordController = asyncHandler(async (req, res) => {
  const validation = resetPasswordSchema.safeParse(req.body);

  if (!validation.success) {
    throw new ApiError(400, validation.error.issues[0].message);
  }

  const result = await resetPassword(validation.data);

  return res.status(200).json(result);
});

/**
 * VERIFY EMAIL
 * GET /api/auth/verify-email?token=xxxx
 */
const verifyEmailController = asyncHandler(async (req, res) => {
  const token = req.query.token;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const result = await verifyEmail(token);

  return res.status(200).json(result);
});

/**
 * RESEND VERIFICATION EMAIL
 */
const resendVerificationController = asyncHandler(async (req, res) => {
  const validation = resendVerificationSchema.safeParse(req.body);

  if (!validation.success) {
    throw new ApiError(400, validation.error.issues[0].message);
  }

  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.ip || "0.0.0.0";

  const result = await resendVerificationEmail(validation.data.email, {
    userAgent,
    ip,
  });

  return res.status(200).json(result);
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshSession,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
  resendVerificationController,
};
