import express from "express";
import {
  loginUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "../controllers/authController";
import {
  loginLimiter,
  passwordResetLimiter,
  tokenVerifyLimiter,
  authGeneralLimiter,
} from "../middlewares/rateLimiter";
import { validateBody } from "../middlewares/validate";
import {
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
} from "../validators/schemas";

const router = express.Router();

// Login: Strict limit (5 attempts / 15 min) - prevents brute-force
router.post("/login", loginLimiter, validateBody(loginSchema), loginUser);

// Refresh token: General limit (30 req / 15 min) - less sensitive
router.post(
  "/refresh-token",
  authGeneralLimiter,
  validateBody(refreshTokenSchema),
  refreshToken,
);

// Forgot password: Strict limit (3 req / 15 min) - prevents email spam
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateBody(requestPasswordResetSchema),
  requestPasswordReset,
);

// Verify reset token: Moderate limit (10 req / 15 min)
router.post(
  "/verify-reset-token",
  tokenVerifyLimiter,
  validateBody(verifyResetTokenSchema),
  verifyResetToken,
);

// Reset password: Moderate limit (10 req / 15 min)
router.post(
  "/reset-password",
  tokenVerifyLimiter,
  validateBody(resetPasswordSchema),
  resetPassword,
);

export default router;
