"use client";

import Link from "next/link";
import { Search, Plus, BookOpen, UsersIcon } from "lucide-react";

// Components
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/admin/StatsCard";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import UserTable from "@/components/admin/UserTable";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Hooks
import { useAuthStore } from "@/stores/user";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { useUserOperations } from "@/hooks/useUserOperations";
import { useUserFilters } from "@/hooks/useUserFilters";

// Utils
import { getRoleLabel, UserRole } from "@/lib/user-utils";
import { useMemo } from "react";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const { isLoading, adminUserManagement, refetch } = useAdminUserManagement();

  const users = adminUserManagement?.users || [];

  const userOperations = useUserOperations({
    currentUserId: user?.id,
    onSuccess: refetch,
  });

  // Filtering
  const {
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filteredUsers,
  } = useUserFilters(users);

  // Stats
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

  // Loading State
  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground animate-pulse text-lg">
            Đang tải dữ liệu...
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              {/* Dialogs */}
              <DeleteUserDialog
                open={userOperations.deleteDialogOpen}
                onClose={() => userOperations.setDeleteDialogOpen(false)}
                onConfirm={userOperations.handleConfirmDelete}
                userName={userOperations.selectedUser?.fullName}
                loading={userOperations.deleteLoading}
              />
              <EditUserDialog
                open={userOperations.editDialogOpen}
                onClose={() => userOperations.setEditDialogOpen(false)}
                onSave={userOperations.handleConfirmUpdate}
                user={userOperations.editUser}
                loading={userOperations.editLoading}
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
                      {role === "all"
                        ? "Tất cả"
                        : getRoleLabel(role as UserRole)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <UserTable
                users={filteredUsers}
                currentUserId={user?.id}
                onEdit={userOperations.handleUpdateRequest}
                onDelete={userOperations.handleDeleteRequest}
                deleteLoading={userOperations.deleteLoading}
              />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
