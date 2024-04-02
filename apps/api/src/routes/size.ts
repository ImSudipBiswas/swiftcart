import { Router } from "express";

import { authenticate, isAdmin } from "../middlewares/auth";
import { createSize, deleteSize, getSizeById, getSizes, updateSize } from "../controllers/size";

const router: Router = Router();

router.route("/").get(getSizes).post(authenticate, isAdmin, createSize);

router
  .route("/:id")
  .get(getSizeById)
  .patch(authenticate, isAdmin, updateSize)
  .delete(authenticate, isAdmin, deleteSize);

export default router;
