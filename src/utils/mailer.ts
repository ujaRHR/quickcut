import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (
  toEmail: string,
  mailSubject: string,
  mailBody: string
) => {
  try {
    const mail = await transporter.sendMail({
      from: `${process.env.PROJECT_NAME} <${process.env.PROJECT_EMAIL}>`,
      to: toEmail,
      subject: mailSubject,
      html: mailBody
    });
    return mail;
  } catch {
    throw new Error("Failed to send email.");
  }
};

export const forgotEmailTemplate = (host: string, token: string) => {
  const resetLink = `${host}/api/auth/reset-password?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password.</p>
      <p>Use the following token:</p>
	  <a href="${resetLink}" style="color: #1a73e8;">${resetLink}</a>
      <p>This token will expire in 15 minutes.</p>
      <hr />
      <p>If you didn't request this, you can ignore this email.</p>
    </div>
  `;
};

export const verifyEmailTemplate = (host: string, token: string) => {
  const verifyLink = `${host}/api/auth/verify-email?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Email Verification</h2>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <a href="${verifyLink}" style="color: #1a73e8;">${verifyLink}</a>
      <p>If you didn't sign up, you can ignore this email.</p>
    </div>
  `;
};
