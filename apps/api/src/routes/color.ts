import { Router } from "express";

import { authenticate, isAdmin } from "../middlewares/auth";
import {
  createColor,
  deleteColor,
  getColorById,
  getColors,
  updateColor,
} from "../controllers/color";

const router: Router = Router();

router.route("/").get(getColors).post(authenticate, isAdmin, createColor);

router
  .route("/:id")
  .get(getColorById)
  .patch(authenticate, isAdmin, updateColor)
  .delete(authenticate, isAdmin, deleteColor);

export default router;
