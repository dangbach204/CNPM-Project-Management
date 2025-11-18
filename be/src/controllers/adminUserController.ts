import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import LogService, { ENTITY_TYPES, LOG_ACTIONS } from "../lib/logService";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, role, password, avatar } = req.body;

    if (!fullName || !email || !role || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name: fullName,
      email,
      role,
      password_hash: passwordHash,
      avatar: avatar ?? null,
    });

    await LogService.log(
      LOG_ACTIONS.CREATE_USER,
      req,
      ENTITY_TYPES.USER,
      newUser.id,
      {
        fullName: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      }
    );

    return res.status(201).json({
      message: "User created successfully",
      id: newUser.id,
      fullName: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Server error while creating user",
      error: error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const userData = {
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };

    await user.destroy();

    await LogService.log(
      LOG_ACTIONS.DELETE_USER,
      req,
      ENTITY_TYPES.USER,
      Number(userId),
      userData
    );

    return res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    return res.status(500).json({
      message: "Lỗi server khi xóa người dùng",
    });
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Number(userIdParam);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId parameter" });
    }

    const { fullName, email, role, avatar } = req.body;

    if (!fullName && !email && !role) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ" });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      user.email = email;
    }

    if (fullName) {
      user.full_name = fullName;
    }

    if (role) {
      const allowedRoles = ["admin", "teacher", "student"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Role không hợp lệ" });
      }
      user.role = role;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    const updatedFields: any = {};
    if (fullName) updatedFields.fullName = fullName;
    if (email) updatedFields.email = email;
    if (role) updatedFields.role = role;
    if (avatar) updatedFields.avatar = avatar;

    await LogService.log(
      LOG_ACTIONS.UPDATE_USER,
      req,
      ENTITY_TYPES.USER,
      userId,
      { updated_fields: Object.keys(updatedFields), ...updatedFields }
    );

    return res.status(200).json({
      message: "Thông tin người dùng đã được cập nhật",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi sửa người dùng:", error);
    return res.status(500).json({
      message: "Lỗi server khi sửa người dùng",
      error: (error as Error).message,
    });
  }
};
