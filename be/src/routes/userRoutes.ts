import express from "express";
import { updateUserProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.patch("/profile", authMiddleware, updateUserProfile);

export default router;
