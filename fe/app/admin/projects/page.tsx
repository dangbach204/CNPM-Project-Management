"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/stores/user";
import { useAdminProjectsManagement } from "@/hooks/useAdminProjectsManagement";
import {
  getProjectStatusColor,
  getProjectStatusLabel,
  countProjectsByStatus,
} from "@/lib/project-utils";
import { useMemo } from "react";
import StatsCard from "@/components/admin/StatsCard";

export default function AdminProjectsPage() {
  const { user } = useAuthStore();
  const { isLoading, projectsManagement } = useAdminProjectsManagement();
  const projects = projectsManagement?.projects || [];

  if (!user || user.role !== "admin") redirect("/login");

  const stats = useMemo(
    () => [
      {
        label: "Tổng đề tài",
        value: projects.length,
        icon: BookOpen,
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Mở",
        value: countProjectsByStatus(projects, "available"),
        icon: BookOpen,
        color: "bg-green-100 text-green-600",
      },
      {
        label: "Đang thực hiện",
        value: countProjectsByStatus(projects, "pending"),
        icon: Clock,
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Hoàn thành",
        value: countProjectsByStatus(projects, "completed"),
        icon: CheckCircle,
        color: "bg-purple-100 text-purple-600",
      },
      {
        label: "Đã phê duyệt",
        value: countProjectsByStatus(projects, "approved"),
        icon: CheckCircle,
        color: "bg-green-100 text-green-600",
      },
    ],
    [projects]
  );

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
                <h1 className="text-3xl font-bold">Quản lý Đề tài</h1>
                <p className="text-muted-foreground mt-2">
                  Quản lý tất cả đề tài trong hệ thống
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stats.map((stat) => (
                <StatsCard key={stat.label} {...stat} />
              ))}
            </div>

            {/* Projects List */}
            <Card>
              <CardContent className="pt-6">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Không có đề tài nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {project.title}
                            </h3>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${getProjectStatusColor(
                                project.status
                              )}`}
                            >
                              {getProjectStatusLabel(project.status)}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {project.description}
                          </p>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                Giảng viên hướng dẫn
                              </p>
                              <p className="font-medium">
                                {project.teacherInstructor || "Không có"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Sinh viên
                              </p>
                              <p className="font-medium">
                                {project.studentCount || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Ngày tạo</p>
                              <p className="font-medium">
                                {new Date(project.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Ngày hết hạn
                              </p>
                              <p className="font-medium">
                                {new Date(project.expiredAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Edit2 className="w-4 h-4" />
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
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
