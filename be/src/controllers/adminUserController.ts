import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, role, password } = req.body;

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
    });

    return res.status(201).json({
      message: "User created successfully",
      id: newUser.id,
      fullName: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Server error while creating user",
      error: error.message,
    });
  }
};
