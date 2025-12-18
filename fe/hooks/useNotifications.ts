import { useState, useEffect, useRef } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from "@/service/notification-service";
import { useToast } from "@/hooks/use-toast";
import { User, Folder, Star, UserPlus, FileText, Bell } from "lucide-react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const previousNotificationIdsRef = useRef<Set<number>>(new Set());

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case "user_created":
        return {
          title: "👤 Tạo người dùng mới",
          icon: "👤"
        };
      case "user_updated":
        return {
          title: "✏️ Cập nhật người dùng",
          icon: "✏️"
        };
      case "project_updated":
        return {
          title: "📁 Cập nhật đề tài",
          icon: "📁"
        };
      case "grade_submitted":
        return {
          title: "⭐ Điểm số mới",
          icon: "⭐"
        };
      case "added_to_project":
        return {
          title: "➕ Thêm vào dự án",
          icon: "➕"
        };
      case "submission_received":
        return {
          title: "📄 Bài nộp mới",
          icon: "📄"
        };
      default:
        return {
          title: "🔔 Thông báo",
          icon: "🔔"
        };
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    const data = await getNotifications();
    if (data) {
      // Kiểm tra thông báo mới dựa trên ID
      const currentIds = new Set(data.notifications.map((n: Notification) => n.id));
      const newNotifications = data.notifications.filter(
        (n: Notification) => !previousNotificationIdsRef.current.has(n.id) && !n.isRead
      );

      // Hiển thị toast cho thông báo mới (chỉ khi không phải lần đầu load)
      if (previousNotificationIdsRef.current.size > 0 && newNotifications.length > 0) {
        // Hiển thị thông báo mới nhất
        const latestNotification = newNotifications[0];
        const config = getNotificationConfig(latestNotification.type);
        toast({
          title: config.title,
          description: `${latestNotification.actor?.name || "Hệ thống"} ${latestNotification.message}`,
          duration: 5000,
        });
      }

      // Cập nhật danh sách ID đã biết
      previousNotificationIdsRef.current = currentIds;
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    const success = await markAsRead(id);
    if (success) {
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteNotification(id);
    if (success) {
      const notification = notifications.find((n) => n.id === id);
      setNotifications(notifications.filter((n) => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
  };
};
