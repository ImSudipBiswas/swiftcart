import { RequestHandler } from "express";

import { db } from "../utils/db";
import { uploadFile } from "../utils/cloudinary";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { sendEmailVerificationMail } from "../utils/mail";
import { decodeToken, generateToken } from "../utils/jwt";
import { signInSchema, signUpSchema, throwZodError } from "../utils/schema";
import { REFRESH_TOKEN_COOKIE_OPTIONS, ACCESS_TOKEN_COOKIE_OPTIONS } from "../utils/constants";

export const signUp: RequestHandler = async (req, res) => {
  try {
    const validatedData = signUpSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ error: throwZodError(validatedData.error) });
    }

    const { name, username, email, password, role } = validatedData.data;

    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ error: "Email or username is already taken" });
    }

    // Delete existing user if email is not verified and user tries to sign up again
    if (existingUser && !existingUser.emailVerified) {
      await db.user.delete({ where: { id: existingUser.id } });
    }

    const hash = await hashPassword(password);
    const emailVerificationToken = generateToken("emailVerification", { email });
    if (!hash || !emailVerificationToken) {
      return res.status(500).json({ error: "Failed to generate tokens" });
    }

    let image = "";
    if (req.file?.path) {
      const url = await uploadFile(req.file.path, "profileImage", "image");
      if (!url) {
        return res.status(500).json({ error: "Failed to upload profile image" });
      }
      image = url;
    }

    const user = await db.user.create({
      data: {
        name,
        username,
        email,
        password: hash,
        role,
        image,
        emailVerificationToken,
      },
    });
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const sendEmailTo = role === "ADMIN" ? "dashboard" : "store";

    const mailResponse = await sendEmailVerificationMail(
      email,
      emailVerificationToken,
      sendEmailTo
    );
    if (!mailResponse) {
      return res.status(500).json({ error: "Failed to send verification mail" });
    }

    return res.status(201).json({ message: "Please check you email to continue" });
  } catch (error: Error | any) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.log("SIGNUP_ROUTE", error);
    return res.status(500).json({ message });
  }
};

export const verifiyEmail: RequestHandler = async (req, res) => {
  try {
    const verificationToken = req.params.token;
    if (!verificationToken) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const decoded = decodeToken("emailVerification", verificationToken) as { email: string } | null;
    if (!decoded || !decoded.email) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const user = await db.user.findUnique({
      where: { email: decoded.email },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const refreshToken = generateToken("refreshToken", { id: user.id });
    const accessToken = generateToken("accessToken", { id: user.id, role: user.role });
    if (!refreshToken || !accessToken) {
      return res.status(500).json({ error: "Failed to generate tokens" });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerifiedAt: new Date(),
        refreshToken,
      },
    });

    return res
      .status(200)
      .cookie("refresh-token", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
      .cookie("access-token", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
      .json({ message: "Signup successfull" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.log("VERIFY_EMAIL_ROUTE", error);
    return res.status(500).json({ message });
  }
};

export const signIn: RequestHandler = async (req, res) => {
  try {
    const validatedData = signInSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ error: throwZodError(validatedData.error) });
    }

    const { email, password } = validatedData.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.emailVerified) {
      return res.status(404).json({ error: "User doesn't exists" });
    }

    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const refreshToken = generateToken("refreshToken", { id: user.id });
    const accessToken = generateToken("accessToken", { id: user.id, role: user.role });
    if (!refreshToken || !accessToken) {
      return res.status(500).json({ error: "Failed to generate tokens" });
    }

    await db.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res
      .status(200)
      .cookie("refresh-token", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
      .cookie("access-token", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
      .json({ message: "Signed in successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.log("SIGNIN_ROUTE", error);
    return res.status(500).json({ message });
  }
};

export const signOut: RequestHandler = async (req, res) => {
  try {
    await db.user.update({
      where: { id: req.user?.id },
      data: { refreshToken: null },
    });

    return res
      .status(200)
      .clearCookie("refresh-token")
      .clearCookie("access-token")
      .json({ message: "Signed out successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.log("SIGNIN_ROUTE", error);
    return res.status(500).json({ message });
  }
};
