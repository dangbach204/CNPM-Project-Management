import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user";
import LogService, { LOG_ACTIONS, ENTITY_TYPES } from "../lib/logService";
import PasswordResetTokens from "../models/passwordResetTokens";
import { sendEmail } from "../utils/sendEmail";

const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "ACCESS_SECRET",
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET",
    { expiresIn: "7d" }
  );
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email và mật khẩu không được để trống" });

  try {
    const user = await User.findOne({
      where: { email, is_active: true },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Email không tồn tại hoặc tài khoản bị khóa" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const access = generateAccessToken(user);
    const refresh = generateRefreshToken(user);

    await LogService.log(LOG_ACTIONS.LOGIN, req, ENTITY_TYPES.USER, user.id, {
      email: user.email,
      user_agent: req.headers["user-agent"],
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      access,
      refresh,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        createAt: user.created_at,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refresh } = req.body;

  if (!refresh) return res.status(400).json({ message: "Thiếu refresh token" });

  try {
    const payload = jwt.verify(
      refresh,
      process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET"
    ) as { id: number };

    const user = await User.findOne({
      where: { id: payload.id, is_active: true },
    });

    if (!user) {
      return res.status(401).json({
        message: "Refresh token không hợp lệ hoặc tài khoản đã bị khóa",
      });
    }

    const newAccess = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "ACCESS_SECRET",
      { expiresIn: "15m" }
    );

    const newRefresh = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET",
      { expiresIn: "7d" }
    );

    return res.json({
      access: newAccess,
      refresh: newRefresh,
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: "Email không hợp lệ." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        message:
          "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email đặt lại mật khẩu.",
      });
    }

    await PasswordResetTokens.destroy({
      where: { user_id: user.id },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expireAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordResetTokens.create({
      user_id: user.id,
      token_hash: hashedToken,
      expire_at: expireAt,
    });

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003366;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested to reset the password for your Student Project Management account.</p>
      <p>Please click the button below to reset your password:</p>
  
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        If you did not request a password reset, please ignore this email. Your account remains secure.
      </p>
  </div>
  `,
    }).catch((err) => {
      console.error(
        "Send reset email failed:",
        err?.response?.data || err.message
      );
    });

    return res.status(200).json({
      message:
        "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email đặt lại mật khẩu.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra." });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  const { email, token } = req.body;

  try {
    if (!email || !token) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: "Email không hợp lệ." });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await PasswordResetTokens.findOne({
      where: {
        user_id: user.id,
        token_hash: hashedToken,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.",
      });
    }

    if (resetToken.expire_at < new Date()) {
      await PasswordResetTokens.destroy({
        where: { user_id: user.id },
      });
      return res
        .status(400)
        .json({ message: "Liên kết đặt lại mật khẩu đã hết hạn." });
    }

    return res.status(200).json({ message: "Token hợp lệ.", valid: true });
  } catch (error) {
    console.error("Verify token error:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;

  try {
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: "Email không hợp lệ." });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await PasswordResetTokens.findOne({
      where: {
        user_id: user.id,
        token_hash: hashedToken,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
      });
    }

    if (resetToken.expire_at < new Date()) {
      await PasswordResetTokens.destroy({
        where: { user_id: user.id },
      });
      return res
        .status(400)
        .json({ message: "Token đặt lại mật khẩu đã hết hạn." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hashedPassword });

    await PasswordResetTokens.destroy({
      where: { user_id: user.id },
    });

    await LogService.log(
      LOG_ACTIONS.RESET_PASSWORD,
      req,
      ENTITY_TYPES.USER,
      user.id,
      {
        email: user.email,
      }
    );

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra." });
  }
};
