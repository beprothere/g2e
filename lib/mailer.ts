import nodemailer from "nodemailer";

const EMAIL_USER = process.env.GMAIL_USER;
const EMAIL_PASS = process.env.GMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ GMAIL ENV VARIABLES MISSING");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ MAILER VERIFY FAILED:", error);
  } else {
    console.log("✅ MAILER READY");
  }
});

export async function sendMail(
to: string, subject: string, html: string, p0: string) {
  try {
    console.log("📧 Sending email to:", to);

    await transporter.sendMail({
      from: `"Glow2Earn" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ EMAIL SENT SUCCESSFULLY");
  } catch (err) {
    console.error("❌ EMAIL SEND FAILED:", err);
  }
}
