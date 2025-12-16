"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, FileText, Plus, Inbox } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import { useTeacherOverview } from "@/hooks/useTeacherOverview";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const { isLoading, overview } = useTeacherOverview();

  const [selectedRole, setSelectedRole] = useState<
    "project" | "submission" | null
  >(null);

  const handleCardClick = (type?: "project" | "submission") => {
    if (type) setSelectedRole(type);
  };

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
    <div 
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen relative"
      style={{
        backgroundImage: 'url(/bkhoa1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl -z-10"></div>
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Bảng điều khiển Giáo viên
        </h1>
        <p className="text-black">
          Chào mừng {user?.fullName}, quản lý đề tài và bài nộp của sinh viên
        </p>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Đề tài Card */}
        <Card 
          className="bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-[1.03] cursor-pointer"
          onClick={() => handleCardClick("project")}
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-6xl font-bold mb-2">
                  {overview?.totalProjects ?? 0}
                </p>
                <p className="text-blue-50 text-base">Đề tài của tôi</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FolderOpen className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bài nộp Card */}
        <Card 
          className="bg-gradient-to-br from-emerald-400 to-green-500 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-[1.03] cursor-pointer"
          onClick={() => handleCardClick("submission")}
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-6xl font-bold mb-2">
                  {overview?.totalSubmissions ?? 0}
                </p>
                <p className="text-green-50 text-base">Bài nộp chờ duyệt</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Create New Project Button */}
      <div>
        <Link href="/teacher/projects/new" className="block">
          <Button 
            size="lg" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo đề tài mới
          </Button>
        </Link>
      </div>

      {/* Data Table */}
      {selectedRole && (
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg font-semibold">
              {selectedRole === "project"
                ? "Danh sách Đề tài"
                : "Danh sách Bài Nộp"}
            </CardTitle>
            <CardDescription>Thông tin chi tiết</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {(overview as Record<string, any>)[selectedRole + "s"]?.length ===
              0 && (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                <Inbox className="w-10 h-10 text-gray-400" />
                <p className="text-muted-foreground text-lg font-medium">
                  Không có dữ liệu để hiển thị
                </p>
              </div>
            )}

            {(overview as Record<string, any>)[selectedRole + "s"]?.length >
              0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-t">
                  <thead className="bg-gray-100">
                    <tr>
                      {selectedRole === "project" && (
                        <>
                          <th className="px-4 py-3 font-semibold">
                            Tên đề tài
                          </th>
                          <th className="px-4 py-3 font-semibold">Mô tả</th>
                          <th className="px-4 py-3 font-semibold text-center">
                            Số sinh viên
                          </th>
                          <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                          <th className="px-4 py-3 font-semibold">Hạn chót</th>
                        </>
                      )}

                      {selectedRole === "submission" && (
                        <>
                          <th className="px-4 py-3 font-semibold">
                            Tên đề tài
                          </th>
                          <th className="px-4 py-3 font-semibold">Sinh viên</th>
                          <th className="px-4 py-3 font-semibold">Ngày nộp</th>
                          <th className="px-4 py-3 font-semibold">Báo cáo</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {selectedRole === "project" &&
                      overview?.projects.map((project: any) => (
                        <tr
                          key={project.id}
                          className="border-b last:border-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3 font-medium">
                            {project.title}
                          </td>
                          <td className="px-4 py-3 max-w-md truncate">
                            {project.description}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {project.studentCount || 0}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(project.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(project.expiredAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                        </tr>
                      ))}

                    {selectedRole === "submission" &&
                      overview?.submissions?.map((submission: any) => (
                        <tr
                          key={submission.id}
                          className="border-b last:border-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3">
                            {submission.projectTitle ||
                              submission.project?.title ||
                              "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {submission.studentName ||
                              submission.student?.fullName ||
                              "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {submission.submittedAt
                              ? new Date(
                                  submission.submittedAt
                                ).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {submission.reportLink ? (
                              <a
                                href={submission.reportLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Xem báo cáo
                              </a>
                            ) : (
                              <span className="text-gray-400">Chưa có</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}