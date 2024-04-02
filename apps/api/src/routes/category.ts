import { Router } from "express";

import { upload } from "../middlewares/multer";
import { authenticate, isAdmin } from "../middlewares/auth";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryImage,
} from "../controllers/category";

const router: Router = Router();

router
  .route("/")
  .get(getCategories)
  .post(authenticate, isAdmin, upload.single("image"), createCategory);

router
  .route("/:id")
  .get(getCategoryById)
  .patch(authenticate, isAdmin, updateCategory)
  .delete(authenticate, isAdmin, deleteCategory);

router
  .route("/:id/image")
  .patch(authenticate, isAdmin, upload.single("image"), updateCategoryImage);

export default router;
