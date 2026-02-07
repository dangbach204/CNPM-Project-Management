import { Request, Response } from "express";
import { adminService } from "../services/adminService";

export const getAdminOverview = async (req: Request, res: Response) => {
  try {
    const overview = await adminService.getOverview();
    return res.status(200).json(overview);
  } catch (error) {
    console.error("Lỗi lấy tổng quan admin:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy dữ liệu",
    });
  }
};

export const getUsersManagement = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 15, 1),
      100,
    );
    const role = req.query.role as string;
    const search = req.query.search as string;

    const result = await adminService.getUsersManagement({
      page,
      limit,
      role,
      search,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi lấy quản lý người dùng:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy dữ liệu",
    });
  }
};

export const getLogsOverview = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 10, 1),
      50,
    );

    const result = await adminService.getLogsOverview({ page, limit });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi lấy logs:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy dữ liệu logs",
    });
  }
};
