import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu không được để trống" });
  }

  try {
    const user = await User.findOne({
      where: { email, is_active: true },
    });

    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại hoặc tài khoản bị khóa",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "YOUR_SECRET_KEY",
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        createAt: user.created_at
      }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
