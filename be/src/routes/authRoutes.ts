import express from "express";
import {
  loginUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "../controllers/authController";

const router = express.Router();

router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

export default router;
