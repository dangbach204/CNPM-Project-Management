"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, BookOpen, FileText, Inbox } from "lucide-react";
import { useAdminOverView } from "@/hooks/useAdminOverView";
import { formatDateTime } from "@/lib/project-helpers";

export default function AdminDashboard() {
  const { isLoading, overview } = useAdminOverView();

  const [selectedRole, setSelectedRole] = useState<
    "teacher" | "student" | "project" | "submission" | null
  >(null);

  const handleCardClick = (
    type?: "teacher" | "student" | "project" | "submission"
  ) => {
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
    <div className="min-h-screen relative">
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

      {/* Main Container with max-width */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Bảng điều khiển
          </h1>
          <p className="text-gray-600">Tổng quan hệ thống quản lý đồ án</p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Tổng Giáo viên",
              value: overview?.teachers.length ?? 0,
              icon: <Users className="w-5 h-5" />,
              bgColor: "bg-blue-50",
              iconColor: "text-blue-600",
              role: "teacher",
            },
            {
              title: "Tổng Sinh viên",
              value: overview?.students.length ?? 0,
              icon: <Users className="w-5 h-5" />,
              bgColor: "bg-green-50",
              iconColor: "text-green-600",
              role: "student",
            },
            {
              title: "Tổng Đề tài",
              value: overview?.totalProjects ?? 0,
              icon: <BookOpen className="w-5 h-5" />,
              bgColor: "bg-purple-50",
              iconColor: "text-purple-600",
              role: "project",
            },
            {
              title: "Bài Nộp",
              value: overview?.totalSubmissions ?? 0,
              icon: <FileText className="w-5 h-5" />,
              bgColor: "bg-orange-50",
              iconColor: "text-orange-600",
              role: "submission",
            },
          ].map((card, idx) => (
            <Card
              key={idx}
              onClick={() => handleCardClick(card.role as any)}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border border-gray-200 bg-white shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-xl ${card.bgColor} shadow-sm`}>
                    <div className={card.iconColor}>{card.icon}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-0.5">
                      {card.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Data Table */}
        {selectedRole && (
          <Card className="overflow-hidden border border-gray-200 shadow-lg bg-white">
            <CardHeader className="bg-linear-to-r from-gray-50 to-slate-50 border-b border-gray-200 py-5">
              <CardTitle className="text-lg font-bold">
                {selectedRole === "teacher"
                  ? "Danh sách Giáo viên"
                  : selectedRole === "student"
                  ? "Danh sách Sinh viên"
                  : selectedRole === "project"
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
                        {selectedRole === "teacher" && (
                          <>
                            <th className="px-4 py-3 font-semibold">
                              Giáo viên
                            </th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                          </>
                        )}

                        {selectedRole === "student" && (
                          <>
                            <th className="px-4 py-3 font-semibold">
                              Sinh viên
                            </th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                          </>
                        )}

                        {selectedRole === "project" && (
                          <>
                            <th className="px-4 py-3 font-semibold">
                              Tên đề tài
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Giảng viên hướng dẫn
                            </th>
                            <th className="px-4 py-3 font-semibold text-center">
                              Số sinh viên
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Ngày tạo
                            </th>
                          </>
                        )}

                        {selectedRole === "submission" && (
                          <>
                            <th className="px-4 py-3 font-semibold">
                              Tên đề tài
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Ngày nộp
                            </th>
                            <th className="px-4 py-3 font-semibold">Báo cáo</th>
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {selectedRole === "teacher" &&
                        overview?.teachers.map((teacher) => (
                          <tr
                            key={teacher.id}
                            className="border-b last:border-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9">
                                  <AvatarImage
                                    src={teacher.avatar}
                                    alt={teacher.fullName}
                                  />
                                  <AvatarFallback className="bg-blue-100 text-blue-700">
                                    {teacher.fullName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {teacher.fullName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{teacher.email}</td>
                          </tr>
                        ))}

                      {selectedRole === "student" &&
                        overview?.students.map((student) => (
                          <tr
                            key={student.id}
                            className="border-b last:border-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9">
                                  <AvatarImage
                                    src={student.avatar}
                                    alt={student.fullName}
                                  />
                                  <AvatarFallback className="bg-green-100 text-green-700">
                                    {student.fullName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {student.fullName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{student.email}</td>
                          </tr>
                        ))}

                      {selectedRole === "project" &&
                        overview?.projects.map((project: any) => (
                          <tr
                            key={project.id}
                            className="border-b last:border-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3 font-medium">
                              {project.title}
                            </td>
                            <td className="px-4 py-3">
                              {project.teacherInstructor}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {project.studentCount}
                            </td>
                            <td className="px-4 py-3">
                              {formatDateTime(project.createdAt)}
                            </td>
                          </tr>
                        ))}

                      {selectedRole === "submission" &&
                        overview?.submissions.map((submission) => (
                          <tr
                            key={submission.id}
                            className="border-b last:border-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-3">
                              {submission.projectTitle}
                            </td>
                            <td className="px-4 py-3">
                              {formatDateTime(submission.submittedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={submission.reportLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Xem báo cáo
                              </a>
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

        {/* Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card className="border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900">
                Đề tài gần đây
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Các đề tài được tạo gần đây nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {overview?.latestProjects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-transparent hover:border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer group"
                  >
                    <div className="p-2.5 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors shadow-sm">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span>
                          Tạo lúc: {formatDateTime(project.createdAt)}
                        </span>
                        <span>Số SV: {project.studentCount || 0}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                        project.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : project.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : project.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : project.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {project.status === "approved"
                        ? "Đã duyệt"
                        : project.status === "pending"
                        ? "Chờ duyệt"
                        : project.status === "completed"
                        ? "Hoàn thành"
                        : project.status === "rejected"
                        ? "Từ chối"
                        : "Khác"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900">
                Bài nộp gần đây
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Các bài nộp mới nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {overview?.latestSubmissions.slice(0, 3).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-transparent hover:border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer group"
                  >
                    <div className="p-2.5 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors shadow-sm">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {submission.projectTitle}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Nộp bài lúc: {formatDateTime(submission.submittedAt)}
                      </p>
                      <a
                        href={submission.reportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline mt-2"
                      >
                        <span>Xem báo cáo</span>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
