import { CookieOptions } from "express";
import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 8000;

export const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:5173";
export const STORE_URL = process.env.STORE_URL || "http://localhost:3000";

export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;
export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;

export const CORS_OPTIONS = {
  origin: [DASHBOARD_URL, STORE_URL],
  credentials: true,
};

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
