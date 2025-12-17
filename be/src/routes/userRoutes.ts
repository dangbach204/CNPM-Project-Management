import express from "express";
import { updateUserProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../config/cloudinary";

const router = express.Router();

router.patch(
  "/profile/:userId",
  authMiddleware,
  upload.single("avatar"),
  updateUserProfile
);

export default router;
