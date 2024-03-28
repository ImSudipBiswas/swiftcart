import { RequestHandler } from "express";
import { UserRole } from "@prisma/client";

import { db } from "../utils/db";
import { handler } from "../utils/api";
import { decodeToken, generateToken } from "../utils/jwt";
import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from "../utils/constants";

// Using module augmentation to add user property to express request object
declare global {
  namespace Express {
    interface Request {
      user?: {
        role: UserRole;
        id: string;
      };
    }
  }
}

export const authenticate: RequestHandler = handler(async (req, res, next) => {
  const refreshToken = req.cookies["refresh-token"];
  const accessToken = req.cookies["access-token"];

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decodedRefreshToken = decodeToken("refreshToken", refreshToken) as { id: string } | null;
  if (!decodedRefreshToken || !decodedRefreshToken.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await db.user.findUnique({
    where: { id: decodedRefreshToken.id },
    select: { id: true, role: true },
  });

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accessTokenValid = accessToken && decodeToken("accessToken", accessToken);
  if (!accessTokenValid || accessTokenValid.id !== user.id) {
    const newAccessToken = generateToken("accessToken", { id: user.id, role: user.role });
    const newRefreshToken = generateToken("refreshToken", { id: user.id });

    res
      .cookie("access-token", newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
      .cookie("refresh-token", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  }

  req.user = user;
  next();
});

export const isAdmin: RequestHandler = handler((req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  return next();
});
