import { Router } from "express";

import { upload } from "../middlewares/multer";
import { signIn, signUp, verifiyEmail, signOut } from "../controllers/auth";
import { authenticate } from "../middlewares/auth";

const router: Router = Router();

router.route("/sign-up").post(upload.single("image"), signUp);
router.route("/verify-email/:token").post(verifiyEmail);
router.route("/sign-in").post(signIn);
router.route("/sign-out").post(authenticate, signOut);

export default router;
