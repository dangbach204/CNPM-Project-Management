"use client";

import Link from "next/link";
import {
  Search,
  Plus,
  BookOpen,
  UsersIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

import { useAuthStore } from "@/stores/user";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { useUserOperations } from "@/hooks/useUserOperations";

import { useMemo, useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const {
    isLoading,
    adminUserManagement,
    refetch,
    params,
    setPage,
    setRole,
    setSearch,
  } = useAdminUserManagement();

  const users = adminUserManagement?.users || [];
  const pagination = adminUserManagement?.pagination;
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalItems || 0;
  const itemsPerPage = pagination?.itemsPerPage || 15;

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch]);

  const userOperations = useUserOperations({
    currentUserId: user?.id,
    onSuccess: refetch,
  });

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const stats = useMemo(
    () => [
      {
        label: "Tổng người dùng",
        value:
          (adminUserManagement?.totalAdmins || 0) +
          (adminUserManagement?.totalTeachers || 0) +
          (adminUserManagement?.totalStudents || 0),
        icon: UsersIcon,
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Giáo viên",
        value: adminUserManagement?.totalTeachers || 0,
        icon: BookOpen,
        color: "bg-purple-100 text-purple-600",
      },
      {
        label: "Sinh viên",
        value: adminUserManagement?.totalStudents || 0,
        icon: UsersIcon,
        color: "bg-green-100 text-green-600",
      },
    ],
    [adminUserManagement]
  );

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto relative">
            {/* BACKGROUND WRAPPER */}
            <div className="absolute top-0 left-0 w-full h-full min-h-full overflow-hidden z-0 pointer-events-none">
              {/* Blurred background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/bkhoa2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                  filter: "blur(10px)",
                  opacity: 0.6,
                  transform: "scale(1.1)",
                }}
              />

              {/* Gradient overlay (fade to white) */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.95) 55%)",
                }}
              />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 py-8 space-y-6">
              {/* Dialogs */}
              <DeleteUserDialog
                open={userOperations.deleteDialogOpen}
                onClose={() => userOperations.setDeleteDialogOpen(false)}
                onConfirm={userOperations.handleConfirmDelete}
                userName={userOperations.selectedUser?.fullName}
                userEmail={userOperations.selectedUser?.email}
                loading={userOperations.deleteLoading}
              />
              <EditUserDialog
                open={userOperations.editDialogOpen}
                onClose={() => userOperations.setEditDialogOpen(false)}
                onSave={userOperations.handleConfirmUpdate}
                user={userOperations.editUser}
                currentUserId={user?.id}
                loading={userOperations.editLoading}
              />

              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Danh sách Người dùng
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý tất cả người dùng trong hệ thống
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                      Đang tải dữ liệu...
                    </p>
                  </div>
                </div>
              )}

              {/* Content - only show when not loading */}
              {!isLoading && (
                <>
                  {/* Stats Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${stat.color} shadow-sm`}
                          >
                            <stat.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              {stat.label}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Search, Filters and Add Button */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                      {/* Search */}
                      <div className="w-full md:flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Tìm kiếm theo tên, email..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="pl-10 h-10"
                        />
                      </div>

                      {/* Role Filter */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Vai trò:
                        </label>
                        <Select
                          value={params.role || "all"}
                          onValueChange={setRole}
                        >
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
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <UserTable
                      users={users}
                      currentUserId={user?.id}
                      onEdit={userOperations.handleUpdateRequest}
                      onDelete={userOperations.handleDeleteRequest}
                      deleteLoading={userOperations.deleteLoading}
                    />

                    {/* Pagination */}
                    {totalItems > 0 && (
                      <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Hiển thị {startIndex}-{endIndex} trong số {totalItems}{" "}
                          người dùng
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1 || isLoading}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>

                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
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
                                  variant={
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setPage(pageNum)}
                                  disabled={isLoading}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}

                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              <span className="text-muted-foreground">...</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(totalPages)}
                                disabled={isLoading}
                                className="w-8 h-8 p-0"
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPage(Math.min(totalPages, currentPage + 1))
                            }
                            disabled={currentPage === totalPages || isLoading}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
