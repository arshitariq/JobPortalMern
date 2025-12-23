
const SESSION_LIFETIME = 60 * 60 * 24 * 30; // 30 days in seconds
const SESSION_REFRESH_TIME = 60 * 60 * 24 * 15; // 15 days in seconds

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SESSION_LIFETIME * 1000,
  path: '/',
};

const ROLES = {
  APPLICANT: 'applicant',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
};

const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf',
  ],
};

module.exports = {
  SESSION_LIFETIME,
  SESSION_REFRESH_TIME,
  COOKIE_OPTIONS,
  ROLES,
  UPLOAD_LIMITS,
};
