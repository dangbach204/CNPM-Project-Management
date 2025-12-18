import api from "@/config/axios";

export interface Notification {
  id: number;
  recipientId: number;
  actorId: number;
  type: "user_updated" | "project_updated" | "grade_submitted" | "added_to_project" | "submission_received";
  entityId: number;
  entityName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actor?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const getNotifications = async (): Promise<NotificationsResponse | null> => {
  try {
    const response = await api.get<NotificationsResponse>("/notifications");
    return response.data;
  } catch (error) {
    console.error("Get notifications failed", error);
    return null;
  }
};

export const markAsRead = async (id: number): Promise<boolean> => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return true;
  } catch (error) {
    console.error("Mark notification as read failed", error);
    return false;
  }
};

export const markAllAsRead = async (): Promise<boolean> => {
  try {
    await api.patch("/notifications/read-all");
    return true;
  } catch (error) {
    console.error("Mark all notifications as read failed", error);
    return false;
  }
};

export const deleteNotification = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/notifications/${id}`);
    return true;
  } catch (error) {
    console.error("Delete notification failed", error);
    return false;
  }
};
