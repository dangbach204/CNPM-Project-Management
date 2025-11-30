"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Clock, Inbox } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import useStudentOverview from "@/hooks/useStudentOverview";
import { StudentOverview } from "@/types/student";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { isLoading, overview } = useStudentOverview();

  const myProject = overview?.myProject || [];
  const mySubmissions: any[] = [];

  const stats = [
    {
      title: "Đề tài tham gia",
      value: myProject.length,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      description: "Các đề tài đang thực hiện",
    },
    {
      title: "Bài nộp",
      value: mySubmissions.length,
      icon: FileText,
      color: "bg-green-100 text-green-600",
      description: "Tổng số bài đã nộp",
    },
  ];

  const getProjectStatusBadge = (status: string) => {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
        Đang thực hiện
      </span>
    );
  };

  const getSubmissionStatusBadge = (status: string) => {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
        Đã nộp
      </span>
    );
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Sinh viên
        </h1>
        <p className="text-muted-foreground">
          Chào mừng {user?.fullName}, theo dõi tiến độ học tập của bạn
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
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
      </section>

      {/* Enrolled Projects */}
      <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Đề tài của tôi
              </CardTitle>
              <CardDescription>Các đề tài bạn đang tham gia</CardDescription>
            </div>
            {myProject.length > 0 && (
              <Link href="/student/projects">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {myProject.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Inbox className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-muted-foreground">
                  Bạn chưa tham gia đề tài nào
                </p>
                <Link href="/student/projects">
                  <Button className="mt-2">Tìm Đề tài</Button>
                </Link>
              </div>
            ) : (
              myProject
                .slice(0, 3)
                .map((project: StudentOverview["myProject"][0]) => (
                  <Link
                    key={project.projectId}
                    href={`/student/projects/${project.projectId}`}
                    className="block"
                  >
                    <div className="p-4 border rounded-lg hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <p className="font-medium group-hover:text-blue-600 transition-colors">
                              {project.title}
                            </p>
                            {getProjectStatusBadge("")}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Xem chi tiết →
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Tham gia:{" "}
                            {new Date(project.joinedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Submissions */}
      <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Bài nộp của tôi
              </CardTitle>
              <CardDescription>Lịch sử bài nộp và trạng thái</CardDescription>
            </div>
            {mySubmissions.length > 0 && (
              <Link href="/student/submissions">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {mySubmissions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-muted-foreground">Chưa có bài nộp nào</p>
                {myProject.length > 0 && (
                  <Link href="/student/projects">
                    <Button className="mt-2">Nộp bài cho đề tài</Button>
                  </Link>
                )}
              </div>
            ) : (
              mySubmissions.slice(0, 3).map((submission) => (
                <Link
                  key={submission.id}
                  href={`/student/submissions/${submission.id}`}
                  className="block"
                >
                  <div className="p-4 border rounded-lg hover:bg-green-50/50 hover:border-green-300 transition-all cursor-pointer group">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <p className="font-medium group-hover:text-green-600 transition-colors">
                            {submission.projectTitle}
                          </p>
                          {submission.status &&
                            getSubmissionStatusBadge(submission.status)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Chi tiết →
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Nộp lúc:{" "}
                          {new Date(submission.submittedAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      {submission.reportLink && (
                        <div className="mt-2">
                          <span className="text-xs text-blue-600 hover:underline">
                            📎 Có file đính kèm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
