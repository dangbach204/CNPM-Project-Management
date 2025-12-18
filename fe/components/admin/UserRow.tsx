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
    <tr className="group hover:bg-blue-50/50 transition-colors duration-200">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          {/* Circular avatar */}
          <img
            src={user.avatar ?? "/placeholder.svg"}
            alt={user.fullName}
            className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm group-hover:ring-blue-200 object-cover transition-all"
          />
          <div>
            <p className="font-semibold text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">ID: {user.id}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
      <td className="py-4 px-6 text-center">
        <span
          className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm border ${
            role === "admin"
              ? "bg-red-50 text-red-700 border-red-200"
              : role === "teacher"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {ROLE_LABELS[role]}
        </span>
      </td>
      <td className="py-4 px-6">
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
