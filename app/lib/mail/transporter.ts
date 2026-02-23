import nodemailer from "nodemailer";

const EMAIL_USER = process.env.GMAIL_USER;
const EMAIL_PASS = process.env.GMAIL_PASS;

export const transporter = nodemailer.createTransport({
 host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
