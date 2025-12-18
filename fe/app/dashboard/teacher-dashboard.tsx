"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  FileText,
  Plus,
  Inbox,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/user";
import { useTeacherOverview } from "@/hooks/useTeacherOverview";
import { formatDate } from "@/lib/project-helpers";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header - Rounded corners with campus background */}
      <div className="p-4 md:p-6">
        <div className="group relative h-[180px] overflow-hidden rounded-2xl max-w-6xl mx-auto">
          <Image
            src="/bkhoa1.jpg"
            alt="Trường Đại học Bách Khoa Đà Nẵng"
            fill
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            priority
          />
          {/* Black gradient overlay - fading from left to right */}
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>

          {/* Header Content */}
          <div className="relative z-10 h-full px-6 md:px-8 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Bảng điều khiển
                </h1>
                <p className="text-[14px] text-white/90">
                  Xin chào{"  "}
                  <span className="font-semibold text-blue-600">
                    {user?.fullName}
                  </span>
                  , chào mừng
                </p>
              </div>
              {/* Primary action */}
              <Link href="/teacher/projects/new">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg h-10 px-4 font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo đề tài mới
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 pb-8 space-y-6 max-w-6xl mx-auto">
        {/* Stats Cards - 2 key metrics in a row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Projects - What I manage */}
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
                    Đề tài
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overview?.totalProjects ?? 0}
                  </p>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Grading - What needs action NOW */}
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[12px] font-medium text-amber-600 uppercase tracking-wide">
                    Chờ chấm điểm
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overview?.pendingSubmissionsCount ?? 0}
                  </p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Actionable Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending Submissions - PRIMARY action area */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Bài nộp cần chấm điểm
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 text-[11px] font-medium"
                >
                  {overview?.pendingSubmissionsCount ?? 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {overview?.pendingSubmissions &&
              overview.pendingSubmissions.length > 0 ? (
                <>
                  {overview.pendingSubmissions
                    .slice(0, 4)
                    .map((submission: any) => {
                      const studentName =
                        submission.studentName ||
                        submission.student?.fullName ||
                        "N/A";
                      const initials = studentName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(-2)
                        .toUpperCase();

                      return (
                        <div
                          key={submission.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          {/* Avatar */}
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-[12px] font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-gray-900">
                              {studentName}
                            </p>
                            <p className="text-[12px] text-gray-600 truncate">
                              Đồ án:{" "}
                              {submission.projectTitle ||
                                submission.project?.title ||
                                "Không có tên"}
                            </p>
                            <p className="text-[11px] text-green-600 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              Nộp:{" "}
                              {submission.submittedAt
                                ? formatRelativeTime(submission.submittedAt)
                                : "N/A"}
                            </p>
                          </div>

                          {/* Action */}
                          <Link
                            href={`/teacher/submissions?gradeId=${submission.id}`}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-[12px] text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              Chấm điểm
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  {overview.pendingSubmissions.length > 4 && (
                    <Link href="/teacher/submissions" className="block pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-9 text-[12px] text-gray-600 hover:text-gray-900"
                      >
                        Xem tất cả {overview.pendingSubmissions.length} bài nộp
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <p className="text-[13px] font-medium text-gray-900">
                    Tuyệt vời!
                  </p>
                  <p className="text-[12px] text-gray-500 mt-1">
                    Không có bài nộp nào cần chấm điểm
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects - Quick access */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                  Đề tài của tôi
                </CardTitle>
                <Link
                  href="/teacher/projects"
                  className="text-[12px] text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  Xem tất cả
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {overview?.projects && overview.projects.length > 0 ? (
                <>
                  {overview.projects.slice(0, 4).map((project: any) => {
                    const daysLeft = Math.ceil(
                      (new Date(project.expiredAt).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const isExpired = daysLeft <= 0;

                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-[13px] font-semibold text-gray-900 truncate">
                            {project.title}
                          </p>
                          {isExpired ? (
                            <Badge className="mt-1 bg-red-100 text-red-600 hover:bg-red-100 text-[10px] px-2 py-0.5">
                              Đã hết hạn
                            </Badge>
                          ) : (
                            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Hạn: {formatDate(project.expiredAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="py-8 text-center">
                  <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-600 mb-3">
                    Chưa có đề tài nào
                  </p>
                  <Link href="/teacher/projects/new">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-[12px]"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Tạo đề tài đầu tiên
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Legacy Data Table - Preserved for detailed views */}
        {selectedRole && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[15px] font-semibold text-gray-900">
                    {selectedRole === "project"
                      ? "Danh sách Đề tài"
                      : "Danh sách Bài Nộp"}
                  </CardTitle>
                  <CardDescription className="text-[12px] mt-1">
                    Thông tin chi tiết
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRole(null)}
                  className="h-8 text-[12px] text-gray-600"
                >
                  Đóng
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {(overview as Record<string, any>)[selectedRole + "s"]?.length ===
                0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Inbox className="w-10 h-10 text-gray-300" />
                  <p className="text-[13px] text-gray-600">
                    Không có dữ liệu để hiển thị
                  </p>
                </div>
              )}

              {(overview as Record<string, any>)[selectedRole + "s"]?.length >
                0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-[13px] text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {selectedRole === "project" && (
                          <>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Tên đề tài
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Mô tả
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Ngày tạo
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Hạn chót
                            </th>
                          </>
                        )}

                        {selectedRole === "submission" && (
                          <>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Tên đề tài
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Sinh viên
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Ngày nộp
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-700">
                              Báo cáo
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {selectedRole === "project" &&
                        overview?.projects.map((project: any) => (
                          <tr
                            key={project.id}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {project.title}
                            </td>
                            <td className="px-4 py-3 max-w-md truncate text-gray-600">
                              {project.description}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {formatDate(project.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {formatDate(project.expiredAt)}
                            </td>
                          </tr>
                        ))}

                      {selectedRole === "submission" &&
                        overview?.pendingSubmissions?.map((submission: any) => (
                          <tr
                            key={submission.id}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3 text-gray-900">
                              {submission.projectTitle ||
                                submission.project?.title ||
                                "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {submission.studentName ||
                                submission.student?.fullName ||
                                "N/A"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {formatDate(submission.submittedAt, "N/A")}
                            </td>
                            <td className="px-4 py-3">
                              {submission.reportLink ? (
                                <a
                                  href={submission.reportLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-[12px]"
                                >
                                  Xem báo cáo
                                </a>
                              ) : (
                                <span className="text-gray-400 text-[12px]">
                                  Chưa có
                                </span>
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
    </div>
  );
}
