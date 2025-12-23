const { transporter } = require("../config/mail");

let mailWarningLogged = false;

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    if (!mailWarningLogged) {
      console.warn("[mail] Transporter missing. Emails are skipped.");
      mailWarningLogged = true;
    }
    return;
  }

  try {
    await transporter.sendMail({
      from:
        process.env.MAIL_FROM ||
        process.env.EMAIL_FROM ||
        "JobPortal <noreply@jobportal.com>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[mail] Failed to send email:", error.message);
  }
};

const verificationEmailTemplate = (name, url) => `
  <div style="font-family: Arial;">
    <h2>Hello ${name},</h2>
    <p>Please verify your email by clicking below:</p>
    <p><a href="${url}">Verify Email</a></p>
    <p>This link will expire soon.</p>
  </div>
`;

const resetPasswordTemplate = (name, url) => `
  <div style="font-family: Arial;">
    <h2>Hello ${name},</h2>
    <p>You requested to reset your password.</p>
    <p><a href="${url}">Reset Password</a></p>
    <p>If you did not request this, ignore this email.</p>
  </div>
`;

module.exports = {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordTemplate,
};
