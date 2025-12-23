const { validateSessionAndGetUser } = require('../services/sessionService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * Require authentication (Session-based)
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const sessionToken = req.cookies.session;

  if (!sessionToken) {
    throw new ApiError(401, 'Unauthorized - No session found');
  }

  const result = await validateSessionAndGetUser(sessionToken);

  if (!result || !result.user) {
    res.clearCookie('session');
    throw new ApiError(401, 'Unauthorized - Invalid session');
  }

  // ✅ NORMALIZED USER OBJECT
  req.user = {
    _id: result.user._id, // Keep MongoDB _id
    id: result.user._id?.toString() || result.user.id,
    role: result.user.role,
    name: result.user.name || '',
    email: result.user.email || '',
  };

  req.session = result.session;

  next();
});

/**
 * Role-based access control with employer companyId support
 */
const requireRole = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Forbidden - Insufficient permissions');
    }

    // ✅ FOR EMPLOYERS: Fetch and attach companyId
    if (req.user.role === 'employer' && !req.user.companyId) {
      const Employer = require('../models/Employer');
      const employer = await Employer.findOne({ userId: req.user._id });
      
      if (employer && employer._id) {
        req.user.companyId = employer._id;
      } else {
        // Employer profile doesn't exist yet
        console.warn(`Employer profile not found for user ${req.user.id}`);
      }
    }

    next();
  });
};

/**
 * Optional authentication (for public routes)
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const sessionToken = req.cookies.session;

  if (sessionToken) {
    const result = await validateSessionAndGetUser(sessionToken);

    if (result && result.user) {
      req.user = {
        _id: result.user._id,
        id: result.user._id?.toString() || result.user.id,
        role: result.user.role,
        name: result.user.name || '',
        email: result.user.email || '',
      };

      req.session = result.session;
    }
  }

  next();
});

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth,
};