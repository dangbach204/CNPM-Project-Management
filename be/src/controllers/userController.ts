import { Request, Response } from "express";
import { User } from "../models";
import bcrypt from "bcrypt";
import LogService, { LOG_ACTIONS, ENTITY_TYPES } from "../lib/logService";

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const requestUser = (req as any).user;
    const targetUserId = req.body.userId || requestUser.id;

    if (requestUser.role !== "admin" && requestUser.id !== targetUserId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thực hiện thao tác này" });
    }

    const { fullName, email, currentPassword, newPassword } = req.body;
    const avatarFile = req.file;

    // console.log("Update Profile Request:");
    // console.log("Body:", req.body);
    // console.log("File:", req.file);
    // console.log("Cloudinary Config:", {
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //   api_key: process.env.CLOUDINARY_API_KEY ? "***" : "missing",
    //   api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : "missing",
    // });

    if (!fullName && !email && !newPassword && !avatarFile) {
      return res
        .status(400)
        .json({ message: "Không có thông tin để cập nhật" });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const updatedFields: string[] = [];
    const logDetails: any = {};

    if (avatarFile) {
      user.avatar = avatarFile.path;
      updatedFields.push("avatar");
      logDetails.new_avatar = avatarFile.path;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập mật khẩu hiện tại" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Mật khẩu hiện tại không đúng" });
      }

      user.password_hash = await bcrypt.hash(newPassword, 10);
      updatedFields.push("password");
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }
      user.email = email;
      updatedFields.push("email");
      logDetails.new_email = email;
    }

    if (fullName && fullName !== user.full_name) {
      user.full_name = fullName;
      updatedFields.push("fullName");
      logDetails.new_fullName = fullName;
    }

    await user.save();

    if (updatedFields.includes("password")) {
      await LogService.log(
        LOG_ACTIONS.CHANGE_PASSWORD,
        req,
        ENTITY_TYPES.USER,
        targetUserId,
        { success: true }
      );
    }

    if (
      updatedFields.some(
        (field) =>
          field === "email" || field === "fullName" || field === "avatar"
      )
    ) {
      await LogService.log(
        LOG_ACTIONS.UPDATE_PROFILE,
        req,
        ENTITY_TYPES.USER,
        targetUserId,
        {
          updated_fields: updatedFields.filter((f) => f !== "password"),
          ...logDetails,
        }
      );
    }

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
