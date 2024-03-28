import { CookieOptions } from "express";
import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 8000;

export const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:5173";
export const STORE_URL = process.env.STORE_URL || "http://localhost:3000";

export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;
export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const EMAIL_VERIFICATION_SECRET = process.env.EMAIL_VERIFICATION_SECRET;

export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL;
export const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD;

export const CORS_OPTIONS = {
  origin: [DASHBOARD_URL, STORE_URL],
  credentials: true,
};

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...COOKIE_OPTIONS,
  maxAge: REFRESH_TOKEN_EXPIRY,
};

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  ...COOKIE_OPTIONS,
  maxAge: ACCESS_TOKEN_EXPIRY,
};

export const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
