import { RequestHandler } from "express";
import { signInSchema, signUpSchema, throwZodError } from "common/lib/schema";

import { db } from "../utils/db";
import { handler } from "../utils/api";
import { uploadFile } from "../utils/cloudinary";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { sendEmailVerificationMail } from "../utils/mail";
import { decodeToken, generateToken } from "../utils/jwt";
import { REFRESH_TOKEN_COOKIE_OPTIONS, ACCESS_TOKEN_COOKIE_OPTIONS } from "../utils/constants";

export const signUp: RequestHandler = handler(async (req, res) => {
  const validatedData = signUpSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({ error: throwZodError(validatedData.error) });
  }

  const { name, username, email, password, role } = validatedData.data;

  const existingUser = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existingUser && existingUser.emailVerified) {
    return res.status(400).json({ message: "Email or username is already taken" });
  }

  // Delete existing user if email is not verified and user tries to sign up again
  if (existingUser && !existingUser.emailVerified) {
    await db.user.delete({ where: { id: existingUser.id } });
  }

  const hash = await hashPassword(password);
  const emailVerificationToken = generateToken("emailVerification", { email });
  if (!hash || !emailVerificationToken) {
    return res.status(500).json({ message: "Failed to generate tokens" });
  }

  let image = "";
  if (req.file?.path) {
    const url = await uploadFile(req.file.path, "profileImage", "image");
    if (!url) {
      return res.status(500).json({ message: "Failed to upload profile image" });
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
    return res.status(500).json({ message: "Failed to create user" });
  }

  const sendEmailTo = role === "ADMIN" ? "dashboard" : "store";

  const mailResponse = await sendEmailVerificationMail(email, emailVerificationToken, sendEmailTo);
  if (!mailResponse) {
    return res.status(500).json({ message: "Failed to send verification mail" });
  }

  return res.status(201).json({ message: "Please check your email to continue" });
});

export const verifyEmail: RequestHandler = handler(async (req, res) => {
  const verificationToken = req.params.token;
  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const decoded = decodeToken("emailVerification", verificationToken) as { email: string } | null;
  if (!decoded || !decoded.email) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const user = await db.user.findUnique({
    where: { email: decoded.email },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }

  if (user.emailVerified) {
    return res.status(400).json({ message: "Email is already verified" });
  }

  const refreshToken = generateToken("refreshToken", { id: user.id });
  const accessToken = generateToken("accessToken", { id: user.id, role: user.role });
  if (!refreshToken || !accessToken) {
    return res.status(500).json({ message: "Failed to generate tokens" });
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
});

export const signIn: RequestHandler = handler(async (req, res) => {
  const validatedData = signInSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({ error: throwZodError(validatedData.error) });
  }

  const { email, password } = validatedData.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.emailVerified) {
    return res.status(404).json({ message: "User doesn't exists" });
  }

  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const refreshToken = generateToken("refreshToken", { id: user.id });
  const accessToken = generateToken("accessToken", { id: user.id, role: user.role });
  if (!refreshToken || !accessToken) {
    return res.status(500).json({ message: "Failed to generate tokens" });
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
});

export const signOut: RequestHandler = handler(async (req, res) => {
  await db.user.update({
    where: { id: req.user?.id },
    data: { refreshToken: null },
  });

  return res
    .status(200)
    .clearCookie("refresh-token")
    .clearCookie("access-token")
    .json({ message: "Signed out successfully" });
});
