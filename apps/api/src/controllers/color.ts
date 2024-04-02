import { RequestHandler } from "express";

import { db } from "../utils/db";
import { handler } from "../utils/api";
import { colorSchema, throwZodError } from "../utils/schema";

export const createColor: RequestHandler = handler(async (req, res) => {
  const validated = colorSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ message: throwZodError(validated.error) });
  }

  const { name, hex, categoryId } = validated.data;

  // User can have multiple colors with the same name or hex but in different categories
  // So we need to check if the color with the provided name or hex already exists in the same category or not
  const existingColor = await db.color.findFirst({
    where: { OR: [{ name }, { hex }], categoryId },
  });
  if (existingColor) {
    return res.status(400).json({ message: "Color with provided name or hex already exists" });
  }

  const color = await db.color.create({ data: { name, hex, categoryId } });

  res.status(201).json({ message: "Color created successfully", color });
});

export const updateColor: RequestHandler = handler(async (req, res) => {
  const validated = colorSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ message: throwZodError(validated.error) });
  }

  const { name, hex, categoryId } = validated.data;

  const existingColor = await db.color.findUnique({ where: { id: req.params.id } });
  if (!existingColor) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  // Check if the category is being changed
  if (categoryId !== existingColor.categoryId) {
    return res.status(400).json({ message: "Category cannot be changed." });
  }

  // Check if the color with the provided name or hex already exists in the same category or not
  const exisitingColorWithProvidedNameOrHex = await db.color.findFirst({
    where: { OR: [{ name }, { hex }], categoryId },
  });
  if (exisitingColorWithProvidedNameOrHex?.id !== req.params.id) {
    return res.status(400).json({ message: "Color with provided name or hex already exists" });
  }

  const color = await db.color.update({
    where: { id: req.params.id },
    data: {
      name,
      hex,
      categoryId,
    },
  });

  return res.status(200).json({ message: "Color updated successfully", color });
});

export const deleteColor: RequestHandler = handler(async (req, res) => {
  const existingColor = await db.color.findUnique({ where: { id: req.params.id } });
  if (!existingColor) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  await db.color.delete({ where: { id: req.params.id } });

  return res.status(200).json({ message: "Color deleted successfully" });
});

export const getColors: RequestHandler = handler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const includeProducts = req.query.includeProducts === "true";
  const includeCategory = req.query.includeCategory === "true";
  const skip = (page - 1) * limit;

  const where = req.query.q
    ? {
        OR: [
          { name: { contains: req.query.q as string } },
          { hex: { contains: req.query.q as string } },
        ],
      }
    : {};

  const documentCount = await db.color.count({ where });
  const isNext = documentCount > page * limit;
  const isPrevious = page > 1;

  const colors = await db.color.findMany({
    skip,
    take: limit,
    where,
    orderBy: { createdAt: "desc" },
    include: { products: includeProducts, category: includeCategory },
  });

  return res.status(200).json({
    message: "Colors fetched successfully",
    page,
    limit,
    documentCount,
    isNext,
    isPrevious,
    colors,
  });
});

export const getColorById: RequestHandler = handler(async (req, res) => {
  const includeCategory = req.query.includeCategory === "true";
  const includeProducts = req.query.includeProducts === "true";

  const color = await db.color.findUnique({
    where: { id: req.params.id },
    include: { category: includeCategory, products: includeProducts },
  });
  if (!color) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  return res.status(200).json({ message: "Color fetched successfully", color });
});
