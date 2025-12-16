"use client";

import Link from "next/link";
import { Search, Plus, BookOpen, UsersIcon, ChevronLeft, ChevronRight } from "lucide-react";

// Components
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useMemo, useState } from "react";

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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
          <main 
            className="flex-1 overflow-y-auto"
            style={{
              backgroundImage: 'url(/bkhoa1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="p-8 space-y-6">
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
              <div>
                <h1 className="text-2xl font-bold">Danh sách Người dùng</h1>
              </div>

              {/* Search, Filters and Add Button */}
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  {/* Search */}
                  <div className="w-full md:flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>

                  {/* Role Filter */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">Vai trò:</label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="h-10 w-40">
                        <SelectValue placeholder="Vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                        <SelectItem value="teacher">Giảng viên</SelectItem>
                        <SelectItem value="student">Sinh viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add User Button */}
                  <Link href="/admin/users/new">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 h-10">
                      <Plus className="w-4 h-4" />
                      Thêm người dùng mới
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <UserTable
                  users={paginatedUsers}
                  currentUserId={user?.id}
                  onEdit={userOperations.handleUpdateRequest}
                  onDelete={userOperations.handleDeleteRequest}
                  deleteLoading={userOperations.deleteLoading}
                />

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} trong số {filteredUsers.length} người dùng
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-muted-foreground">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}