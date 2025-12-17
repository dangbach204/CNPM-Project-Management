"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/auth";
import { AlertTriangle, Upload, X } from "lucide-react";

type UserRole = "admin" | "teacher" | "student";

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    userId: number,
    updatedUser: {
      fullName: string;
      email: string;
      role: UserRole;
      avatar?: string | File;
    }
  ) => void;
  user: User | null;
  currentUserId?: number;
  loading?: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  student: "Sinh viên",
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function EditUserDialog({
  open,
  onClose,
  onSave,
  user,
  currentUserId,
  loading = false,
}: EditUserDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const isEditingSelf = user?.id === currentUserId;

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName);
      setEmail(user.email);
      setRole((user.role as UserRole) || "student");
      setAvatarPreview(user.avatar ?? null);
      setAvatarFile(null);
      setFileError("");
    }
  }, [user, open]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      fullName.trim() !== user.fullName ||
      role !== user.role ||
      avatarFile !== null
    );
  }, [user, fullName, role, avatarFile]);

  const isFormValid = useMemo(() => {
    return fullName.trim().length > 0 && !fileError;
  }, [fullName, fileError]);

  const handleSave = () => {
    if (!user || !isFormValid) return;
    onSave(user.id, {
      fullName: fullName.trim(),
      email,
      role,
      avatar: avatarFile ?? undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError("Kích thước ảnh không được vượt quá 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFileError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar ?? null);
    setFileError("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 border-gray-200">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-100">
          <DialogTitle className="text-lg font-medium text-gray-900">
            Chỉnh sửa người dùng
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3 pb-5 border-b border-gray-100">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
              <AvatarFallback className="text-xl font-semibold bg-blue-500 text-white">
                {fullName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <label htmlFor="avatar-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 cursor-pointer"
                  disabled={loading}
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4" />
                    Chọn ảnh
                  </span>
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              {avatarFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={loading}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  Xóa ảnh mới
                </Button>
              )}
            </div>

            {fileError && <p className="text-xs text-red-600">{fileError}</p>}
            <p className="text-xs text-gray-500 text-center">
              Chấp nhận: JPG, PNG, GIF. Tối đa 2MB
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="fullName"
              className="text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ"
              className="h-10 border-gray-200 rounded-lg"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              className="h-10 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email không thể thay đổi</p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label
              htmlFor="role"
              className="text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Vai trò
            </Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
              disabled={loading || isEditingSelf}
            >
              <SelectTrigger className="h-10 border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditingSelf && (
              <Alert className="border-amber-200 bg-amber-50 mt-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800">
                  Không thể tự thay đổi vai trò của chính mình
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !hasChanges || !isFormValid}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
