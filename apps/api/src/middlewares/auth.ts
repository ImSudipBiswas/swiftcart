import { RequestHandler } from "express";
import { UserRole } from "@prisma/client";

import { db } from "../utils/db";
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

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies["refresh-token"];
    const accessToken = req.cookies["access-token"];

    if (!refreshToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedRefreshToken = decodeToken("refreshToken", refreshToken) as { id: string } | null;
    if (!decodedRefreshToken || !decodedRefreshToken.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { id: decodedRefreshToken.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
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
  } catch (error) {
    console.log("AUTH_MIDDLEWARE", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const isAdmin: RequestHandler = (req, res, next) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    return next();
  } catch (error) {
    console.log("ISADMIN_MIDDLEWARE", error);
    return res.status(403).json({ error: "Access denied" });
  }
};
