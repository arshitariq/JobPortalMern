const nodemailer = require("nodemailer");

const resolveBool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  const normalized = String(value).toLowerCase();
  return ["true", "1", "yes"].includes(normalized);
};

const primaryUser = process.env.MAIL_FROM || process.env.EMAIL_USER;
const primaryPass = process.env.MAIL_PASSWORD || process.env.EMAIL_PASSWORD;

let transporter = null;

if (primaryUser && primaryPass) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || process.env.EMAIL_PORT || 587),
    secure: resolveBool(
      process.env.MAIL_SECURE ?? process.env.EMAIL_SECURE,
      false
    ),
    auth: {
      user: primaryUser,
      pass: primaryPass,
    },
    tls: {
      rejectUnauthorized: resolveBool(
        process.env.MAIL_TLS_REJECT_UNAUTHORIZED ??
          process.env.EMAIL_TLS_REJECT_UNAUTHORIZED,
        true
      ),
    },
  });
}

module.exports = { transporter };
