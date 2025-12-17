"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, Trash2 } from "lucide-react";
import { User } from "@/types/auth";

type UserRole = "admin" | "teacher" | "student";

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700",
  teacher: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  student: "Sinh viên",
};

interface UserRowProps {
  user: User;
  currentUserId?: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  deleteLoading?: boolean;
}

export default function UserRow({
  user,
  currentUserId,
  onEdit,
  onDelete,
  deleteLoading = false,
}: UserRowProps) {
  const isCurrentUser = currentUserId === user.id;
  const role = (user.role || "student") as UserRole;

  return (
    <tr className="group border-b border-border/40 hover:bg-muted/30 transition-all">
      <td className="py-3 px-5">
        <div className="flex items-center gap-3">
          {/* Circular avatar */}
          <img
            src={user.avatar ?? "/placeholder.svg"}
            alt={user.fullName}
            className="w-9 h-9 rounded-full ring-2 ring-background group-hover:ring-primary/40 object-cover"
          />
          <div>
            <p className="font-medium text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-5 text-sm text-muted-foreground">{user.email}</td>
      <td className="py-3 px-5 text-center">
        <span
          className={`inline-block text-xs px-3 py-1 rounded-full font-medium shadow-sm ${ROLE_COLORS[role]}`}
        >
          {ROLE_LABELS[role]}
        </span>
      </td>
      <td className="py-3 px-5">
        <div className="flex justify-center gap-2">
          {/* Edit button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
            onClick={() => onEdit(user)}
          >
            <Edit2 className="w-4 h-4" />
            <span>Sửa</span>
          </Button>

          {/* Delete button with conditional tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 ${
                      isCurrentUser
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                    }`}
                    onClick={() => !isCurrentUser && onDelete(user)}
                    disabled={deleteLoading || isCurrentUser}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isCurrentUser ? "Không thể xóa" : "Xóa"}</span>
                  </Button>
                </span>
              </TooltipTrigger>
              {isCurrentUser && (
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-xs">
                    Bạn không thể xóa tài khoản đang đăng nhập. Vui lòng sử dụng
                    tài khoản admin khác để thực hiện thao tác này.
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </tr>
  );
}
