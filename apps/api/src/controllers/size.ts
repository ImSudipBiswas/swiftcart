import { RequestHandler } from "express";

import { db } from "../utils/db";
import { handler } from "../utils/api";
import { sizeSchema, throwZodError } from "../utils/schema";

export const createSize: RequestHandler = handler(async (req, res) => {
  const validated = sizeSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ message: throwZodError(validated.error) });
  }

  const { name, value, categoryId } = validated.data;

  // User can have multiple sizes with the same name or its value but in different categories
  // So we need to check if the size with the provided name or value already exists in the same category or not
  const existingSize = await db.size.findFirst({
    where: { OR: [{ name }, { value }], categoryId },
  });
  if (existingSize) {
    return res.status(400).json({ message: "Size with provided name or value already exists" });
  }

  const size = await db.size.create({ data: { name, value, categoryId } });

  res.status(201).json({ message: "Size created successfully", size });
});

export const updateSize: RequestHandler = handler(async (req, res) => {
  const validated = sizeSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ message: throwZodError(validated.error) });
  }

  const { name, value, categoryId } = validated.data;

  const existingSize = await db.size.findUnique({ where: { id: req.params.id } });
  if (!existingSize) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  // Check if the category is being changed
  if (categoryId !== existingSize.categoryId) {
    return res.status(400).json({ message: "Category cannot be changed." });
  }

  // Check if the size with the provided name or value already exists in the same category or not
  const exisitingSizeWithProvidedNameOrHex = await db.size.findFirst({
    where: { OR: [{ name }, { value }], categoryId },
  });
  if (exisitingSizeWithProvidedNameOrHex?.id !== req.params.id) {
    return res.status(400).json({ message: "Size with provided name or value already exists" });
  }

  const size = await db.size.update({
    where: { id: req.params.id },
    data: {
      name,
      value,
      categoryId,
    },
  });

  return res.status(200).json({ message: "Size updated successfully", size });
});

export const deleteSize: RequestHandler = handler(async (req, res) => {
  const existingSize = await db.size.findUnique({ where: { id: req.params.id } });
  if (!existingSize) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  await db.size.delete({ where: { id: req.params.id } });

  return res.status(200).json({ message: "Size deleted successfully" });
});

export const getSizes: RequestHandler = handler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const includeProducts = req.query.includeProducts === "true";
  const includeCategory = req.query.includeCategory === "true";
  const skip = (page - 1) * limit;

  const where = req.query.q
    ? {
        OR: [
          { name: { contains: req.query.q as string } },
          { value: { contains: req.query.q as string } },
        ],
      }
    : {};

  const documentCount = await db.size.count({ where });
  const isNext = documentCount > page * limit;
  const isPrevious = page > 1;

  const sizes = await db.size.findMany({
    skip,
    take: limit,
    where,
    orderBy: { createdAt: "desc" },
    include: { products: includeProducts, category: includeCategory },
  });

  return res.status(200).json({
    message: "Sizes fetched successfully",
    page,
    limit,
    documentCount,
    isNext,
    isPrevious,
    sizes,
  });
});

export const getSizeById: RequestHandler = handler(async (req, res) => {
  const includeCategory = req.query.includeCategory === "true";
  const includeProducts = req.query.includeProducts === "true";

  const size = await db.size.findUnique({
    where: { id: req.params.id },
    include: { category: includeCategory, products: includeProducts },
  });
  if (!size) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  return res.status(200).json({ message: "Size fetched successfully", size });
});
