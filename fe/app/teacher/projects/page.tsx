"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTeacherOverview } from "@/hooks/useTeacherOverview";

export default function TeacherProjectsPage() {
  const { user } = useAuthStore();
  const { overview, isLoading } = useTeacherOverview();

  const myProjects = overview?.projects || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-100 text-blue-700";
      case "approved":
        return "bg-purple-100 text-purple-700";
      case "open":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "archived":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "approved":
        return "Đã Phê Duyệt";
      case "open":
        return "Mở";
      case "in-progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "archived":
        return "Lưu trữ";
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto relative" style={{
            backgroundImage: 'url(/bkhoa2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}>
            <div className="absolute inset-0 bg-white/15 backdrop-blur-[1px] -z-10"></div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Danh sách đề tài</h1>
                </div>
                <Link href="/teacher/projects/new">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo Đề tài Mới
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">Đang tải...</p>
                  </CardContent>
                </Card>
              ) : myProjects.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      Bạn chưa tạo đề tài nào
                    </p>
                    <Link href="/teacher/projects/new">
                      <Button>Tạo Đề tài Đầu tiên</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {myProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">
                                {project.title}
                              </h3>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {getStatusLabel(project.status)}
                              </span>
                            </div>
                            <p className="text-muted-foreground mb-4">
                              {project.description}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Sinh viên
                                </p>
                                <p className="text-lg font-semibold">
                                  {project.studentCount || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Ngày tạo
                                </p>
                                <p className="text-lg font-semibold">
                                  {new Date(
                                    project.createdAt
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Hạn chót
                                </p>
                                <p className="text-lg font-semibold">
                                  {new Date(project.expiredAt).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </p>
                              </div>
                            </div>

                            {project.studentCount && project.studentCount > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {project.studentCount} sinh viên đã đăng ký
                                </span>
                                <Link href={`/teacher/projects/${project.id}/students`}>
                                  <span className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer ml-1">
                                    Xem
                                  </span>
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/teacher/projects/${project.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                              >
                                <Edit2 className="w-4 h-4" />
                                Sửa
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-destructive hover:text-destructive bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
