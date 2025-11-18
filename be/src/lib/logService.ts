import Log from "../models/log";
import { Request } from "express";

class LogService {
  private static getIpAddress(req: Request): string {
    let ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      ip = "127.0.0.1";
    }

    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }

    return ip;
  }

  static async log(
    action: string,
    req: Request,
    entityType?: string,
    entityId?: number,
    details?: any
  ) {
    try {
      const userId = (req as any).user?.id || null;
      const ipAddress = this.getIpAddress(req);

      // Tạo timestamp theo local time (UTC+7)
      const now = new Date();

      await Log.create({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        ip_address: ipAddress,
        created_at: now,
      });
    } catch (error) {
      console.error("Error creating log:", error);
    }
  }

  static async logLogin(req: Request, userId: number, userEmail: string) {
    await this.log(LOG_ACTIONS.LOGIN, req, ENTITY_TYPES.USER, userId, {
      email: userEmail,
      user_agent: req.headers["user-agent"],
    });
  }

  static async logLogout(req: Request) {
    await this.log(
      LOG_ACTIONS.LOGOUT,
      req,
      ENTITY_TYPES.USER,
      (req as any).user?.id
    );
  }

  static async getLogs(page = 1, pageSize = 50, filters?: any) {
    const offset = (page - 1) * pageSize;
    const where: any = {};

    if (filters?.userId) where.user_id = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entity_type = filters.entityType;
    if (filters?.entityId) where.entity_id = filters.entityId;

    return await Log.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset,
    });
  }
}

export const LOG_ACTIONS = {
  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  //   REGISTER: "REGISTER",

  // Project
  CREATE_PROJECT: "CREATE_PROJECT",
  UPDATE_PROJECT: "UPDATE_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",

  // Student - Project
  ADD_STUDENT: "ADD_STUDENT",
  REMOVE_STUDENT: "REMOVE_STUDENT",

  // Submission
  CREATE_SUBMISSION: "CREATE_SUBMISSION",
  UPDATE_SUBMISSION: "UPDATE_SUBMISSION",
  DELETE_SUBMISSION: "DELETE_SUBMISSION",

  // Grade
  CREATE_GRADE: "CREATE_GRADE",
  UPDATE_GRADE: "UPDATE_GRADE",
  DELETE_GRADE: "DELETE_GRADE",

  // User
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  CHANGE_PASSWORD: "CHANGE_PASSWORD",
  UPDATE_PROFILE: "UPDATE_PROFILE",

  // Feedback
  CREATE_FEEDBACK: "CREATE_FEEDBACK",
  UPDATE_FEEDBACK: "UPDATE_FEEDBACK",
  DELETE_FEEDBACK: "DELETE_FEEDBACK",
} as const;

export const ENTITY_TYPES = {
  USER: "User",
  PROJECT: "Project",
  SUBMISSION: "Submission",
  GRADE: "Grade",
  FEEDBACK: "Feedback",
  PROJECT_STUDENT: "ProjectStudent",
} as const;

export default LogService;
