const argon2 = require("argon2");
const User = require("../models/User");
const Applicant = require("../models/Applicant");
const Employer = require("../models/Employer");
const Token = require("../models/Token");
const { createSession, setSessionCookie, invalidateAllUserSessions } = require("./sessionService");
const ApiError = require("../utils/ApiError");
const { deleteFile } = require("./uploadService");
const { generateRawToken, hashToken } = require("./tokenService");
const { sendEmail, verificationEmailTemplate, resetPasswordTemplate } = require("./mailService");

const EMAIL_VERIFY_EXPIRES_MIN = 30;
const RESET_EXPIRES_MIN = 15;

const sanitizeClientInfo = (userAgent = "", ip = "") => ({
  issuedUserAgent: userAgent || "Unknown",
  issuedFromIp: ip || "0.0.0.0",
});

const registerUser = async (data, userAgent, ip, profileImage, res) => {
  let createdUserId = null;
  let createdProfileType = null; // "applicant" | "employer"
  let createdTokenId = null;
  const clientInfo = sanitizeClientInfo(userAgent, ip);

  try {
    const { name, userName, email, password, role, phoneNumber } = data;

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      if (profileImage) await deleteFile(`uploads/profiles/${profileImage}`);
      throw new ApiError(400, existingUser.email === email ? "Email already exists" : "Username already exists");
    }

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
      name,
      userName: userName.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phoneNumber,
      profileImage,
      isEmailVerified: false,
    });
    createdUserId = user._id;

    if (role === "applicant") {
      await Applicant.create({ userId: user._id });
      createdProfileType = "applicant";
    }

    if (role === "employer") {
      await Employer.create({ userId: user._id });
      createdProfileType = "employer";
    }

    // create email verification token
    const raw = generateRawToken();
    const tokenDoc = await Token.create({
      userId: user._id,
      userType: user.role,
      type: "email_verify",
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + EMAIL_VERIFY_EXPIRES_MIN * 60 * 1000),
      issuedUserAgent: clientInfo.issuedUserAgent,
      issuedFromIp: clientInfo.issuedFromIp,
    });
    createdTokenId = tokenDoc._id;

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: verificationEmailTemplate(user.name, verifyUrl),
    });

    const { token } = await createSession({ userId: user._id.toString(), userAgent, ip });
    setSessionCookie(res, token);

    return {
      status: "SUCCESS",
      message: "Registration completed. Please verify your email.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          userName: user.userName,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        },
      },
    };
  } catch (err) {
    if (createdTokenId) {
      await Token.findByIdAndDelete(createdTokenId).catch(() => {});
    }
    if (createdProfileType === "applicant" && createdUserId) {
      await Applicant.deleteOne({ userId: createdUserId }).catch(() => {});
    }
    if (createdProfileType === "employer" && createdUserId) {
      await Employer.deleteOne({ userId: createdUserId }).catch(() => {});
    }
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(() => {});
    }
    if (profileImage) await deleteFile(`uploads/profiles/${profileImage}`);
    throw err;
  }
};

const loginUser = async (data, userAgent, ip, res) => {
  const { email, password } = data;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const ok = await argon2.verify(user.password, password);
  if (!ok) throw new ApiError(401, "Invalid email or password");

  const { token } = await createSession({ userId: user._id.toString(), userAgent, ip });
  setSessionCookie(res, token);

  return { status: "SUCCESS", message: "Login successful", data: { user: {
    id: user._id, name: user.name, userName: user.userName, email: user.email, role: user.role, profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
  }}};
};

const resendVerificationEmail = async (email, metadata = {}) => {
  const { issuedUserAgent, issuedFromIp } = sanitizeClientInfo(
    metadata.userAgent,
    metadata.ip
  );

  const user = await User.findOne({ email });
  if (!user) return { status: "SUCCESS", message: "If the email exists, verification mail has been sent." };
  if (user.isEmailVerified) return { status: "SUCCESS", message: "Email is already verified." };

  await Token.deleteMany({ userId: user._id, type: "email_verify" });

  const raw = generateRawToken();
  await Token.create({
    userId: user._id,
    userType: user.role,
    type: "email_verify",
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + EMAIL_VERIFY_EXPIRES_MIN * 60 * 1000),
    issuedUserAgent,
    issuedFromIp,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your email (Resent)",
    html: verificationEmailTemplate(user.name, verifyUrl),
  });

  return { status: "SUCCESS", message: "Verification email resent successfully." };
};

const verifyEmail = async (rawToken) => {
  const tokenDoc = await Token.findOne({ type: "email_verify", tokenHash: hashToken(rawToken) });
  if (!tokenDoc) throw new ApiError(400, "Invalid or expired token");

  const user = await User.findById(tokenDoc.userId);
  if (!user) throw new ApiError(404, "User not found");

  user.isEmailVerified = true;
  await user.save();

  await Token.deleteMany({ userId: user._id, type: "email_verify" });

  return { status: "SUCCESS", message: "Email verified successfully." };
};

const forgotPassword = async (email, metadata = {}) => {
  const { issuedUserAgent, issuedFromIp } = sanitizeClientInfo(
    metadata.userAgent,
    metadata.ip
  );

  const user = await User.findOne({ email });
  // Always return success (security)
  if (!user) return { status: "SUCCESS", message: "If the email exists, reset link has been sent." };

  await Token.deleteMany({ userId: user._id, type: "password_reset" });

  const raw = generateRawToken();
  await Token.create({
    userId: user._id,
    userType: user.role,
    type: "password_reset",
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + RESET_EXPIRES_MIN * 60 * 1000),
    issuedUserAgent,
    issuedFromIp,
  });

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${raw}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: resetPasswordTemplate(user.name, resetUrl),
  });

  return { status: "SUCCESS", message: "If the email exists, reset link has been sent." };
};

const resetPassword = async ({ token, password }) => {
  const tokenDoc = await Token.findOne({ type: "password_reset", tokenHash: hashToken(token) });
  if (!tokenDoc) throw new ApiError(400, "Invalid or expired token");

  const user = await User.findById(tokenDoc.userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  user.password = await argon2.hash(password);
  await user.save();

  await Token.deleteMany({ userId: user._id, type: "password_reset" });
  await invalidateAllUserSessions(user._id);

  return { status: "SUCCESS", message: "Password reset successfully. Please login now." };
};

module.exports = {
  registerUser,
  loginUser,
  resendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
