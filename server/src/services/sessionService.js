const crypto = require('crypto');
const Session = require('../models/Session');
const User = require('../models/User');
const {
  SESSION_LIFETIME,
  SESSION_REFRESH_TIME,
  COOKIE_OPTIONS,
} = require('../config/constants');

const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const createSession = async (data) => {
  const token = generateSessionToken();
  const hashedToken = hashToken(token);

  const session = await Session.create({
    _id: hashedToken,
    userId: data.userId,
    userAgent: data.userAgent,
    ip: data.ip,
    expiresAt: new Date(Date.now() + SESSION_LIFETIME * 1000),
  });

  return { token, session };
};

const setSessionCookie = (res, token) => {
  res.cookie('session', token, COOKIE_OPTIONS);
};

const validateSessionAndGetUser = async (sessionToken) => {
  const hashedToken = hashToken(sessionToken);

  const session = await Session.findById(hashedToken);

  if (!session) return null;

  // Check if session is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await Session.findByIdAndDelete(session._id);
    return null;
  }

  // Refresh session if needed
  const shouldRefresh =
    Date.now() >= session.expiresAt.getTime() - SESSION_REFRESH_TIME * 1000;

  if (shouldRefresh) {
    session.expiresAt = new Date(Date.now() + SESSION_LIFETIME * 1000);
    await session.save();
  }

  const user = await User.findById(session.userId);

  if (!user) {
    await Session.findByIdAndDelete(session._id);
    return null;
  }

  return {
    user,
    session: {
      id: session._id,
      userId: session.userId.toString(),
      expiresAt: session.expiresAt,
      userAgent: session.userAgent,
      ip: session.ip,
    },
  };
};

const invalidateSession = async (sessionId) => {
  await Session.findByIdAndDelete(sessionId);
};

const invalidateAllUserSessions = async (userId) => {
  await Session.deleteMany({ userId });
};

module.exports = {
  generateSessionToken,
  hashToken,
  createSession,
  setSessionCookie,
  validateSessionAndGetUser,
  invalidateSession,
  invalidateAllUserSessions,
};