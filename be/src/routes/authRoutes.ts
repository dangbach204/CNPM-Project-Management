import express from "express";
import { loginUser, refreshToken } from "../controllers/authController";

const router = express.Router();

router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);

export default router;
