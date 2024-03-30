import nodemailer from "nodemailer";

import { DASHBOARD_URL, STORE_URL, NODEMAILER_EMAIL, NODEMAILER_PASSWORD } from "./constants";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});

export const sendEmailVerificationMail = async (
  email: string,
  token: string,
  to: "dashboard" | "store"
) => {
  const host = to === "dashboard" ? DASHBOARD_URL : STORE_URL;

  const response = await transporter.sendMail({
    from: "sudipbiswas2142@gmail.com",
    to: email,
    subject: "Confirm your email address",
    html: `
      <h1>Confirm your email address</h1>
      <p>Click the link below to confirm your email address</p>
      <a href="${host}/auth/verify-email?token=${token}">Verify Email</a>
    `,
  });

  if (!response.messageId) return false;

  return true;
};
