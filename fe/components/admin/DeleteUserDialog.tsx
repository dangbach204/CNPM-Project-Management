"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  userEmail?: string;
  loading?: boolean;
}

export default function DeleteUserDialog({
  open,
  onClose,
  onConfirm,
  userName,
  userEmail,
  loading = false,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Xác nhận xóa người dùng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <DialogDescription className="text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa người dùng sau?
          </DialogDescription>

          {/* User info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Tên người dùng
              </p>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
            </div>
            {userEmail && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
              </div>
            )}
          </div>

          {/* Warning */}
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm text-red-800">
              <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất
              cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-w-[100px]"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="min-w-[100px] bg-red-600 hover:bg-red-700"
          >
            {loading ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
