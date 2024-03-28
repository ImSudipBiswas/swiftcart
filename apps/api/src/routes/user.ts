import { Router } from "express";

import { upload } from "../middlewares/multer";
import { authenticate } from "../middlewares/auth";
import {
  addUserAvatar,
  currentUser,
  deleteUser,
  deleteUserAvatar,
  getUserById,
  getUsers,
  updateUser,
  updateUserAvatar,
} from "../controllers/user";

const router: Router = Router();

router.use(authenticate);

router.route("/current").get(currentUser);
router.route("/").get(getUsers).patch(updateUser).delete(deleteUser);
router.route("/:id").get(getUserById);
router
  .route("/avatar")
  .post(upload.single("image"), addUserAvatar)
  .patch(upload.single("image"), updateUserAvatar)
  .delete(deleteUserAvatar);

export default router;
