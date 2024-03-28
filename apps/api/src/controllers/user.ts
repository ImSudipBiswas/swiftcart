import { RequestHandler } from "express";

import { db } from "../utils/db";
import { handler } from "../utils/api";
import { deleteFile, uploadFile } from "../utils/cloudinary";
import { throwZodError, updateUserSchema } from "../utils/schema";

const select = { id: true, name: true, username: true, email: true, image: true, role: true };

export const currentUser: RequestHandler = handler(async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.user?.id }, select });
  return res.status(200).json({ message: "Current profile fetched successfully", user });
});

export const getUserById: RequestHandler = handler(async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.params.id }, select });
  return res.status(200).json({ message: "User profile fetched successfully", user });
});

export const getUsers: RequestHandler = handler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const whereQuery = req.query.q ? { name: { contains: req.query.q as string } } : {};
  const skip = (page - 1) * limit;

  const documentCount = await db.user.count();
  const isNext = documentCount > page * limit;
  const isPrevious = page > 1;

  const users = await db.user.findMany({
    skip,
    take: limit,
    where: whereQuery,
    orderBy: { createdAt: "desc" },
    select,
  });

  return res.status(200).json({
    message: "User profiles fetched successfully",
    page,
    limit,
    documentCount,
    isNext,
    isPrevious,
    users,
  });
});

export const updateUser: RequestHandler = handler(async (req, res) => {
  const validatedData = updateUserSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({ errors: throwZodError(validatedData.error) });
  }

  const { name, username } = validatedData.data;

  const isUsernameTaken = await db.user.findUnique({ where: { username } });
  if (isUsernameTaken && isUsernameTaken.id !== req.user?.id) {
    return res.status(400).json({ message: "Username is already taken" });
  }

  const user = await db.user.update({
    where: { id: req.user?.id },
    data: { name, username },
    select,
  });

  return res.status(200).json({ message: "Profile updated successfully", user });
});

export const addUserAvatar: RequestHandler = handler(async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).json({ message: "Image is required" });
  }

  const imageUrl = await uploadFile(filePath, "profileImage", "image");
  if (!imageUrl) {
    return res.status(400).json({ message: "Image upload failed" });
  }

  const user = await db.user.update({
    where: { id: req.user?.id },
    data: { image: imageUrl },
    select,
  });

  return res.status(200).json({ message: "Profile image added successfully", user });
});

export const updateUserAvatar: RequestHandler = handler(async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).json({ message: "Image is required" });
  }

  const imageUrl = await uploadFile(filePath, "profileImage", "image");
  if (!imageUrl) {
    return res.status(400).json({ message: "Image upload failed" });
  }

  const user = await db.user.findUnique({ where: { id: req.user?.id } });
  if (user?.image) {
    const deleted = await deleteFile(user.image, "profileImage", "image");
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete previous image" });
    }
  }

  const updatedUser = await db.user.update({
    where: { id: req.user?.id },
    data: { image: imageUrl },
    select,
  });

  return res.status(200).json({ message: "Profile image updated successfully", user: updatedUser });
});

export const deleteUserAvatar: RequestHandler = handler(async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.user?.id } });
  if (!user?.image) {
    return res.status(400).json({ message: "Profile image not found" });
  }

  const isDeleted = await deleteFile(user.image, "profileImage", "image");
  if (!isDeleted) {
    return res.status(500).json({ message: "Failed to delete profile image" });
  }
  const updatedUser = await db.user.update({
    where: { id: req.user?.id },
    data: { image: null },
    select,
  });

  return res.status(200).json({ message: "Profile image deleted successfully", user: updatedUser });
});

export const deleteUser: RequestHandler = handler(async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.user?.id } });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.image) {
    const deleted = await deleteFile(user.image, "profileImage", "image");
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete account" });
    }
  }

  await db.user.delete({ where: { id: req.user?.id } });

  return res
    .status(200)
    .clearCookie("refresh-token")
    .clearCookie("access-token")
    .json({ message: "User deleted successfully" });
});
