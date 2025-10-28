"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUsers } from "@/lib/mock-data";
import { Search, Plus, Edit2, Trash2, BookOpen, UsersIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/user";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const { isLoading, adminUserManagement } = useAdminUserManagement();

  if (!user || user.role !== "admin") redirect("/login");

  const filteredUsers = adminUserManagement?.users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterRole === "all") return matchesSearch;
    return matchesSearch && u.role === filterRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "teacher":
        return "bg-blue-100 text-blue-700";
      case "student":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "teacher":
        return "Giáo viên";
      case "student":
        return "Sinh viên";
      default:
        return role;
    }
  };

  const stats = [
    {
      label: "Tổng người dùng",
      value: adminUserManagement?.users.length || 0,
      icon: UsersIcon,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Giáo viên",
      value: adminUserManagement?.users.filter((u) => u.role === "teacher").length || 0,
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Sinh viên",
      value: adminUserManagement?.users.filter((u) => u.role === "student").length || 0,
      icon: UsersIcon,
      color: "bg-green-100 text-green-600",
    },
  ];

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

            {/* Stats Grid */}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-3xl font-bold mt-2">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                <Button
                  variant={filterRole === "all" ? "default" : "outline"}
                  onClick={() => setFilterRole("all")}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filterRole === "admin" ? "default" : "outline"}
                  onClick={() => setFilterRole("admin")}
                >
                  Quản trị viên
                </Button>
                <Button
                  variant={filterRole === "teacher" ? "default" : "outline"}
                  onClick={() => setFilterRole("teacher")}
                >
                  Giáo viên
                </Button>
                <Button
                  variant={filterRole === "student" ? "default" : "outline"}
                  onClick={() => setFilterRole("student")}
                >
                  Sinh viên
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="pt-6">
                {filteredUsers && filteredUsers.length === 0 ? (
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
                        {filteredUsers?.map((u) => (
                          <tr
                            key={u.id}
                            className="group border-b border-border/40 hover:bg-muted/30 transition-all"
                          >
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={"/placeholder.svg"}
                                  alt={u.fullName}
                                  className="w-9 h-9 rounded-full ring-2 ring-background group-hover:ring-primary/40 transition-all"
                                />
                                <div>
                                  <p className="font-medium text-foreground">
                                    {u.fullName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {u.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-5 text-sm text-muted-foreground">
                              {u.email}
                            </td>

                            <td className="py-3 px-5 text-center">
                              <span
                                className={`inline-block text-xs px-3 py-1 rounded-full font-medium shadow-sm ${getRoleColor(
                                  u.role || "student"
                                )}`}
                              >
                                {getRoleLabel(u.role || "student")}
                              </span>
                            </td>

                            <td className="py-3 px-5">
                              <div className="flex justify-center gap-2">
                                <Link href={`/admin/users/${u.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-border/60 hover:border-primary/50 hover:bg-primary/5"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Sửa</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Xóa</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
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