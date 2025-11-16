import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteUser, updateUserInfo } from "@/service/admin-service";
import { User } from "@/types/auth";
import { UserRole } from "@/lib/user-utils";

interface UseUserOperationsProps {
  currentUserId?: number;
  onSuccess?: () => void;
}

export function useUserOperations({
  currentUserId,
  onSuccess,
}: UseUserOperationsProps) {
  const { toast } = useToast();

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleDeleteRequest = useCallback(
    (userToDelete: User) => {
      if (currentUserId === userToDelete.id) {
        toast({
          title: "Không thể xóa chính bạn",
          description: "Vui lòng đăng nhập bằng tài khoản khác để xóa.",
          variant: "destructive",
        });
        return;
      }
      setSelectedUser(userToDelete);
      setDeleteDialogOpen(true);
    },
    [currentUserId, toast]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      await deleteUser(selectedUser.id);
      toast({ title: "Xóa thành công" });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      toast({
        title: "Xóa thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedUser, toast, onSuccess]);

  const handleUpdateRequest = useCallback((userToEdit: User) => {
    setEditUser(userToEdit);
    setEditDialogOpen(true);
  }, []);

  const handleConfirmUpdate = useCallback(
    async (
      userId: number,
      data: { fullName: string; email: string; role: UserRole; avatar?: string }
    ) => {
      setEditLoading(true);
      try {
        await updateUserInfo(userId, data);
        toast({ title: "Cập nhật thành công" });
        setEditDialogOpen(false);
        setEditUser(null);
        onSuccess?.();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
        toast({
          title: "Cập nhật thất bại",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setEditLoading(false);
      }
    },
    [toast, onSuccess]
  );

  return {
    // Delete
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedUser,
    deleteLoading,
    handleDeleteRequest,
    handleConfirmDelete,
    // Edit
    editDialogOpen,
    setEditDialogOpen,
    editUser,
    editLoading,
    handleUpdateRequest,
    handleConfirmUpdate,
  };
}
