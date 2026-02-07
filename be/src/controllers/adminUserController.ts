import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import LogService, { ENTITY_TYPES, LOG_ACTIONS } from "../lib/logService";
import { notifyOtherAdmins } from "./notificationController";
import sequelize from "../config/db";

export const createUser = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { fullName, email, role, password } = req.body;
    const avatarFile = req.file;

    // Check for existing email within transaction with lock
    const existingUser = await User.findOne({
      where: { email },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      {
        full_name: fullName,
        email,
        role,
        password_hash: passwordHash,
        avatar: avatarFile ? avatarFile.path : null,
      },
      { transaction },
    );

    await LogService.log(
      LOG_ACTIONS.CREATE_USER,
      req,
      ENTITY_TYPES.USER,
      newUser.id,
      {
        fullName: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
    );

    await transaction.commit();

    // Gửi thông báo cho các admin khác (outside transaction - non-critical)
    if (req.user?.id) {
      await notifyOtherAdmins(
        req.user.id,
        "user_created",
        newUser.id,
        newUser.full_name,
        `đã tạo tài khoản mới "${newUser.full_name}" (${newUser.role})`,
      );
    }

    return res.status(201).json({
      message: "User created successfully",
      id: newUser.id,
      fullName: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Server error while creating user",
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
      userData,
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
  const transaction = await sequelize.transaction();

  try {
    const userIdParam = req.params.userId;
    const userId = Number(userIdParam);

    const { fullName, email, role } = req.body;
    const avatarFile = req.file;

    // Lock the user row to prevent concurrent modifications
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (email && email !== user.email) {
      // Check email uniqueness within transaction with lock
      const existing = await User.findOne({
        where: { email },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (existing && existing.id !== user.id) {
        await transaction.rollback();
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      user.email = email;
    }

    if (fullName) {
      user.full_name = fullName;
    }

    if (role) {
      user.role = role;
    }

    if (avatarFile) {
      user.avatar = avatarFile.path;
    }

    await user.save({ transaction });

    const updatedFields: any = {};
    if (fullName) updatedFields.fullName = fullName;
    if (email) updatedFields.email = email;
    if (role) updatedFields.role = role;
    if (avatarFile) updatedFields.avatar = avatarFile.path;

    await LogService.log(
      LOG_ACTIONS.UPDATE_USER,
      req,
      ENTITY_TYPES.USER,
      userId,
      { updated_fields: Object.keys(updatedFields), ...updatedFields },
    );

    await transaction.commit();

    // Notifications outside transaction (non-critical)
    if (req.user?.id) {
      await notifyOtherAdmins(
        req.user.id,
        "user_updated",
        userId,
        user.full_name,
        `đã cập nhật thông tin người dùng "${user.full_name}"`,
      );
    }

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
    await transaction.rollback();
    console.error("Lỗi sửa người dùng:", error);
    return res.status(500).json({
      message: "Lỗi server khi sửa người dùng",
    });
  }
};
