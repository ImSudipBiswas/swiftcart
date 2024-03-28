import { RequestHandler } from "express";

export const handler = (controller: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      console.error("Controller Error:", error);
      res.status(500).json({ message });
    }
  };
};
