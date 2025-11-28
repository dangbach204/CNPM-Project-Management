import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import LogService, { LOG_ACTIONS, ENTITY_TYPES } from "../lib/logService";

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
