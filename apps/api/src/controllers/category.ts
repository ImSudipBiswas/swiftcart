import { RequestHandler } from "express";

import { db } from "../utils/db";
import { handler } from "../utils/api";
import { deleteFile, uploadFile } from "../utils/cloudinary";
import { categorySchema, throwZodError } from "../utils/schema";

export const createCategory: RequestHandler = handler(async (req, res) => {
  const validated = categorySchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ message: throwZodError(validated.error) });
  }

  const { labelText, name, description } = validated.data;

  if (!req.file?.path) {
    return res.status(400).json({ message: "Category image is required" });
  }

  const exisitingCategoryWithProvidedName = await db.category.findUnique({ where: { name } });
  if (exisitingCategoryWithProvidedName) {
    return res.status(400).json({ message: "Category with provided name already exists" });
  }

  const uploadedImage = await uploadFile(req.file.path, "categoryImage", "image");
  if (!uploadedImage) {
    return res.status(500).json({ message: "Failed to upload image" });
  }

  const category = await db.category.create({
    data: {
      name,
      labelText,
      description,
      image: uploadedImage,
    },
  });

  return res.status(201).json({ message: "Category created successfully", category });
});

export const updateCategory: RequestHandler = handler(async (req, res) => {
  const validated = categorySchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ message: throwZodError(validated.error) });
  }

  const existingCategory = await db.category.findUnique({ where: { id: req.params.id } });
  if (!existingCategory) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { labelText, name, description } = validated.data;

  const exisitingCategoryWithProvidedName = await db.category.findUnique({ where: { name } });
  if (exisitingCategoryWithProvidedName?.id !== req.params.id) {
    return res.status(400).json({ message: "Category with provided name already exists" });
  }

  const category = await db.category.update({
    where: { id: req.params.id },
    data: { labelText, name, description },
  });

  return res.status(200).json({ message: "Category updated successfully", category });
});

export const updateCategoryImage: RequestHandler = handler(async (req, res) => {
  const existingCategory = await db.category.findUnique({ where: { id: req.params.id } });
  if (!existingCategory) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (!req.file?.path) {
    return res.status(400).json({ message: "Category image is required" });
  }

  const deleteImage = await deleteFile(existingCategory.image, "categoryImage", "image");
  if (!deleteImage) {
    return res.status(500).json({ message: "Failed to delete existing image" });
  }

  const uploadedImage = await uploadFile(req.file.path, "categoryImage", "image");
  if (!uploadedImage) {
    return res.status(500).json({ message: "Failed to upload image" });
  }

  const category = await db.category.update({
    where: { id: req.params.id },
    data: { image: uploadedImage },
  });

  return res.status(200).json({ message: "Category image updated successfully", category });
});

export const deleteCategory: RequestHandler = handler(async (req, res) => {
  const existingCategory = await db.category.findUnique({ where: { id: req.params.id } });
  if (!existingCategory) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const deleteImage = await deleteFile(existingCategory.image, "categoryImage", "image");
  if (!deleteImage) {
    return res.status(500).json({ message: "Failed to delete image" });
  }

  await db.category.delete({ where: { id: req.params.id } });

  return res.status(200).json({ message: "Category deleted successfully" });
});

export const getCategories: RequestHandler = handler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const includeProducts = req.query.includeProducts === "true";
  const includeColors = req.query.includeColors === "true";
  const includeSizes = req.query.includeSizes === "true";
  const skip = (page - 1) * limit;

  const where = req.query.q
    ? {
        OR: [
          { name: { contains: req.query.q as string } },
          { labelText: { contains: req.query.q as string } },
          { description: { contains: req.query.q as string } },
        ],
      }
    : {};

  const documentCount = await db.category.count({ where });
  const isNext = documentCount > page * limit;
  const isPrevious = page > 1;

  const categories = await db.category.findMany({
    skip,
    take: limit,
    where,
    orderBy: { createdAt: "desc" },
    include: { products: includeProducts, colors: includeColors, sizes: includeSizes },
  });

  return res.status(200).json({
    message: "Categories fetched successfully",
    page,
    limit,
    documentCount,
    isNext,
    isPrevious,
    categories,
  });
});

export const getCategoryById: RequestHandler = handler(async (req, res) => {
  const includeProducts = req.query.includeProducts === "true";
  const includeColors = req.query.includeColors === "true";
  const includeSizes = req.query.includeSizes === "true";

  const category = await db.category.findUnique({
    where: { id: req.params.id },
    include: { products: includeProducts, colors: includeColors, sizes: includeSizes },
  });
  if (!category) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  return res.status(200).json({ message: "Category fetched", category });
});
