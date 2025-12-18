import { Request, Response } from "express";
import { Notification, User } from "../models";
import { Op } from "sequelize";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    console.log("getNotifications called");
    const userId = req.user?.id;
    console.log("User ID:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await Notification.findAll({
      where: { recipientId: userId },
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    console.log("Found notifications:", notifications.length);

    // Đếm số thông báo chưa đọc
    const unreadCount = await Notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await Notification.findOne({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.update({ isRead: true });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Notification.update(
      { isRead: true },
      {
        where: {
          recipientId: userId,
          isRead: false,
        },
      }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({ message: "Error marking all notifications as read" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await Notification.findOne({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.destroy();

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};

// Helper function để tạo thông báo và giới hạn 5 thông báo
export const createNotification = async (data: {
  recipientId: number;
  actorId: number;
  type: "user_updated" | "project_updated" | "grade_submitted" | "added_to_project" | "submission_received";
  entityId: number;
  entityName: string;
  message: string;
}) => {
  try {
    // Tạo thông báo mới
    await Notification.create(data);

    // Lấy tất cả thông báo của recipient, sắp xếp theo thời gian
    const allNotifications = await Notification.findAll({
      where: { recipientId: data.recipientId },
      order: [["createdAt", "DESC"]],
    });

    // Nếu có hơn 5 thông báo, xóa những thông báo cũ nhất
    if (allNotifications.length > 5) {
      const notificationsToDelete = allNotifications.slice(5);
      const idsToDelete = notificationsToDelete.map((n) => n.id);

      await Notification.destroy({
        where: {
          id: {
            [Op.in]: idsToDelete,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Helper function để tạo thông báo cho giáo viên
export const notifyTeacher = async (
  teacherId: number,
  actorId: number,
  type: "submission_received",
  entityId: number,
  entityName: string,
  message: string
) => {
  try {
    await createNotification({
      recipientId: teacherId,
      actorId,
      type,
      entityId,
      entityName,
      message,
    });
  } catch (error) {
    console.error("Error notifying teacher:", error);
  }
};

// Helper function để tạo thông báo cho sinh viên
export const notifyStudent = async (
  studentId: number,
  actorId: number,
  type: "grade_submitted" | "added_to_project" | "project_updated",
  entityId: number,
  entityName: string,
  message: string
) => {
  try {
    await createNotification({
      recipientId: studentId,
      actorId,
      type,
      entityId,
      entityName,
      message,
    });
  } catch (error) {
    console.error("Error notifying student:", error);
  }
};

// Helper function để tạo thông báo cho tất cả admin khác
export const notifyOtherAdmins = async (
  actorId: number,
  type: "user_updated" | "project_updated",
  entityId: number,
  entityName: string,
  message: string
) => {
  try {
    // Tìm tất cả admin khác (không bao gồm actor)
    const otherAdmins = await User.findAll({
      where: {
        role: "admin",
        id: {
          [Op.ne]: actorId,
        },
      },
    });

    // Tạo thông báo cho mỗi admin
    for (const admin of otherAdmins) {
      await createNotification({
        recipientId: admin.id,
        actorId,
        type,
        entityId,
        entityName,
        message,
      });
    }
  } catch (error) {
    console.error("Error notifying other admins:", error);
  }
};
