"use client";

import { Bell, Check, Trash2, User, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "user_created":
        return <User className="w-4 h-4 text-green-500" />;
      case "user_updated":
        return <User className="w-4 h-4 text-blue-500" />;
      case "project_updated":
        return <Folder className="w-4 h-4 text-green-500" />;
      case "grade_submitted":
        return <Bell className="w-4 h-4 text-purple-500" />;
      case "added_to_project":
        return <Folder className="w-4 h-4 text-orange-500" />;
      case "submission_received":
        return <Folder className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "user_created":
        return "Tạo người dùng mới";
      case "user_updated":
        return "Cập nhật người dùng";
      case "project_updated":
        return "Cập nhật đề tài";
      case "grade_submitted":
        return "Điểm số mới";
      case "added_to_project":
        return "Thêm vào dự án";
      case "submission_received":
        return "Bài nộp mới";
      default:
        return "Thông báo";
    }
  };

  const getScoreColor = (message: string) => {
    const scoreMatch = message.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      if (score > 8.5) return "text-green-600 font-bold";
      if (score >= 7) return "text-yellow-600 font-bold";
      return "text-red-600 font-bold";
    }
    return "";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Không có thông báo</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {getNotificationTitle(notification.type)}
                          </p>
                          <p className={`text-sm mt-1 ${
                            notification.type === "grade_submitted"
                              ? getScoreColor(notification.message)
                              : "text-muted-foreground"
                          }`}>
                            <span className="font-medium">
                              {notification.actor?.name}
                            </span>{" "}
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: vi,
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
