"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, BookOpen, FileText, Inbox } from "lucide-react";
import { useAdminOverView } from "@/hooks/useAdminOverView";

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
    <div className="p-8 space-y-10">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý đồ án
        </p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Tổng Giáo viên",
            value: overview?.teachers.length ?? 0,
            icon: <Users className="w-6 h-6" />,
            color: "blue",
            role: "teacher",
          },
          {
            title: "Tổng Sinh viên",
            value: overview?.students.length ?? 0,
            icon: <Users className="w-6 h-6" />,
            color: "green",
            role: "student",
          },
          {
            title: "Tổng Đề tài",
            value: overview?.totalProjects ?? 0,
            icon: <BookOpen className="w-6 h-6" />,
            color: "purple",
            role: "project",
          },
          {
            title: "Bài Nộp",
            value: overview?.totalSubmissions ?? 0,
            icon: <FileText className="w-6 h-6" />,
            color: "orange",
            role: "submission",
          },
        ].map((card, idx) => (
          <Card
            key={idx}
            onClick={() => handleCardClick(card.role as any)}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <div
                  className={`p-3 rounded-lg bg-${card.color}-100 text-${card.color}-600`}
                >
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Data Table */}
      {selectedRole && (
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg font-semibold">
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
                          <th className="px-4 py-3 font-semibold">Họ và tên</th>
                          <th className="px-4 py-3 font-semibold">Email</th>
                        </>
                      )}

                      {selectedRole === "student" && (
                        <>
                          <th className="px-4 py-3 font-semibold">Họ và tên</th>
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
                          <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                        </>
                      )}

                      {selectedRole === "submission" && (
                        <>
                          <th className="px-4 py-3 font-semibold">
                            Tên đề tài
                          </th>
                          <th className="px-4 py-3 font-semibold">Ngày nộp</th>
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
                          <td className="px-4 py-3">{teacher.fullName}</td>
                          <td className="px-4 py-3">{teacher.email}</td>
                        </tr>
                      ))}

                    {selectedRole === "student" &&
                      overview?.students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b last:border-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3">{student.fullName}</td>
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
                          <td className="px-4 py-3">{project.createdAt}</td>
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
                            {submission.submittedAt}
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
        <Card>
          <CardHeader>
            <CardTitle>Đề tài gần đây</CardTitle>
            <CardDescription>Các đề tài được tạo gần đây nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview?.latestProjects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="flex items-start justify-between pb-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tạo lúc {project.createdAt}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Số sinh viên tham gia: {project.studentCount || 0}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
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
        <Card>
          <CardHeader>
            <CardTitle>Bài nộp gần đây</CardTitle>
            <CardDescription>Các bài nộp mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview?.latestSubmissions.slice(0, 3).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-start justify-between pb-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{submission.projectTitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nộp bài lúc: {submission.submittedAt}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Báo cáo:{" "}
                      <a
                        href={submission.reportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Tại đây
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
