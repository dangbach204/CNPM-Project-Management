"use client";

import { useState, useCallback, useMemo } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Edit2, Trash2, BookOpen, UsersIcon } from "lucide-react";

// Components
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Hooks & Services
import { useAuthStore } from "@/stores/user";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { useToast } from "@/hooks/use-toast";
import { deleteUser, updateUserInfo } from "@/service/admin-service";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Types
type UserRole = "admin" | "teacher" | "student";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

interface EditUserData {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

// Constants
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

const getRoleColor = (role: UserRole): string => ROLE_COLORS[role];
const getRoleLabel = (role: UserRole): string => ROLE_LABELS[role];

const StatsCard = ({ label, value, icon: Icon, color }: any) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DeleteDialog = ({
  open,
  onOpenChange,
  user,
  loading,
  onConfirm,
}: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogDescription>
          Bạn có chắc muốn xóa <strong>{user?.fullName}</strong>? Hành động này
          không thể hoàn tác.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          {loading ? "Đang xóa..." : "Xác nhận xóa"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const EditDialog = ({
  open,
  onOpenChange,
  user,
  loading,
  onConfirm,
  fullName,
  setFullName,
  email,
  setEmail,
  role,
  setRole,
}: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogDescription>
          Cập nhật thông tin cho <strong>{user?.fullName}</strong>.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Họ và tên</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Vai trò</label>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Quản trị viên</SelectItem>
              <SelectItem value="teacher">Giáo viên</SelectItem>
              <SelectItem value="student">Sinh viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const UserRow = ({
  user,
  currentUserId,
  onEdit,
  onDelete,
  deleteLoading,
}: any) => {
  const isCurrentUser = currentUserId === user.id;

  return (
    <tr className="group border-b border-border/40 hover:bg-muted/30 transition-all">
      <td className="py-3 px-5">
        <div className="flex items-center gap-3">
          <img
            src="/placeholder.svg"
            alt={user.fullName}
            className="w-9 h-9 rounded-full ring-2 ring-background group-hover:ring-primary/40 transition-all"
          />
          <div>
            <p className="font-medium text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.id}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-5 text-sm text-muted-foreground">{user.email}</td>
      <td className="py-3 px-5 text-center">
        <span
          className={`inline-block text-xs px-3 py-1 rounded-full font-medium shadow-sm ${getRoleColor(
            user.role
          )}`}
        >
          {getRoleLabel(user.role)}
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
};

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { isLoading, adminUserManagement, refetch } = useAdminUserManagement();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<EditUserData | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("student");
  const [editLoading, setEditLoading] = useState(false);

  // Auth Check
  if (!user || user.role !== "admin") redirect("/login");

  // Computed Values
  const users = adminUserManagement?.users || [];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterRole === "all") return matchesSearch;
      return matchesSearch && u.role === filterRole;
    });
  }, [users, searchTerm, filterRole]);

  const stats = useMemo(
    () => [
      {
        label: "Tổng người dùng",
        value: users.length,
        icon: UsersIcon,
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Giáo viên",
        value: users.filter((u) => u.role === "teacher").length,
        icon: BookOpen,
        color: "bg-purple-100 text-purple-600",
      },
      {
        label: "Sinh viên",
        value: users.filter((u) => u.role === "student").length,
        icon: UsersIcon,
        color: "bg-green-100 text-green-600",
      },
    ],
    [users]
  );

  // Handlers
  const handleDeleteRequest = useCallback(
    (userToDelete: User) => {
      if (user && user.id === userToDelete.id) {
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
    [user, toast]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      await deleteUser(selectedUser.id);
      toast({ title: "Xóa thành công" });
      await refetch();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Xóa thất bại",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedUser, refetch, toast]);

  const handleUpdateRequest = useCallback((userToEdit: User) => {
    setEditUser(userToEdit);
    setEditFullName(userToEdit.fullName);
    setEditEmail(userToEdit.email);
    setEditRole(userToEdit.role);
    setEditDialogOpen(true);
  }, []);

  const handleConfirmUpdate = useCallback(async () => {
    if (!editUser) return;

    setEditLoading(true);
    try {
      await updateUserInfo(editUser.id, {
        fullName: editFullName,
        email: editEmail,
        role: editRole,
      });
      toast({ title: "Cập nhật thành công" });
      await refetch();
      setEditDialogOpen(false);
      setEditUser(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Cập nhật thất bại",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  }, [editUser, editFullName, editEmail, editRole, refetch, toast]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground animate-pulse text-lg">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Dialogs */}
            <DeleteDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              user={selectedUser}
              loading={deleteLoading}
              onConfirm={handleConfirmDelete}
            />
            <EditDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              user={editUser}
              loading={editLoading}
              onConfirm={handleConfirmUpdate}
              fullName={editFullName}
              setFullName={setEditFullName}
              email={editEmail}
              setEmail={setEditEmail}
              role={editRole}
              setRole={setEditRole}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
                <p className="text-muted-foreground mt-2">
                  Quản lý tài khoản và quyền hạn người dùng
                </p>
              </div>
              <Link href="/admin/users/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm Người dùng
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <StatsCard key={stat.label} {...stat} />
              ))}
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                {["all", "admin", "teacher", "student"].map((role) => (
                  <Button
                    key={role}
                    variant={filterRole === role ? "default" : "outline"}
                    onClick={() => setFilterRole(role)}
                  >
                    {role === "all" ? "Tất cả" : getRoleLabel(role as UserRole)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="pt-6">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Không tìm thấy người dùng nào
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-muted/50 text-sm text-muted-foreground">
                          <th className="text-left py-3 px-5 font-semibold rounded-tl-lg">
                            Tên
                          </th>
                          <th className="text-left py-3 px-5 font-semibold">
                            Email
                          </th>
                          <th className="text-center py-3 px-5 font-semibold">
                            Vai trò
                          </th>
                          <th className="text-center py-3 px-5 font-semibold rounded-tr-lg">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <UserRow
                            key={u.id}
                            user={u}
                            currentUserId={user?.id}
                            onEdit={handleUpdateRequest}
                            onDelete={handleDeleteRequest}
                            deleteLoading={deleteLoading}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
