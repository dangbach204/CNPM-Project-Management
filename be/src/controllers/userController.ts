import { Request, Response } from "express";
import { User } from "../models";
import bcrypt from "bcrypt";

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { fullName, email, currentPassword, newPassword } = req.body;

    if (!fullName && !email && !newPassword) {
      return res
        .status(400)
        .json({ message: "Không có thông tin để cập nhật" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const requestUser = (req as any).user; 
    if (
      requestUser &&
      requestUser.id !== parseInt(userId) &&
      requestUser.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật thông tin này" });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Mật khẩu hiện tại không đúng" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password_hash = hashedPassword;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }
      user.email = email;
    }

    if (fullName && fullName !== user.full_name) {
      user.full_name = fullName;
    }

    await user.save();

    return res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
