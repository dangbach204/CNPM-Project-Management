"use client";

import { Button } from "@/components/ui/button";
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
          {/* Star-shaped avatar: use SVG clipPath to mask image into a star. Falls back to placeholder.svg */}
          <div className="w-9 h-9 relative">
            <svg viewBox="0 0 100 100" className="w-9 h-9 block">
              <defs>
                <clipPath id={`starClip-${user.id}`} clipPathUnits="objectBoundingBox">
                  {/* star path in normalized coords */}
                  <path d="M0.5 0.02 L0.63 0.36 L0.98 0.36 L0.69 0.57 L0.8 0.91 L0.5 0.7 L0.2 0.91 L0.31 0.57 L0.02 0.36 L0.37 0.36 Z" />
                </clipPath>
              </defs>
              {user.avatar ? (
                <image
                  href={user.avatar}
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#starClip-${user.id})`}
                />
              ) : (
                <image
                  href="/placeholder.svg"
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#starClip-${user.id})`}
                />
              )}
            </svg>
            <span className="absolute inset-0 rounded-full ring-2 ring-background group-hover:ring-primary/40 pointer-events-none" />
          </div>
          <div>
            <p className="font-medium text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.id}</p>
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/60 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => onEdit(user)}
          >
            <Edit2 className="w-4 h-4" />
            <span>Sửa</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onDelete(user)}
            disabled={deleteLoading || isCurrentUser}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isCurrentUser ? "Không thể xóa" : "Xóa"}</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
