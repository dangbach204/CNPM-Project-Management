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
import { useState, useEffect } from "react";
import { Project, Submission } from "@/types/admin";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_COLORS,
} from "@/types/status";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledProjects, setEnrolledProjects] = useState<Project[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);

  // Simulating API call - replace with actual API when backend is ready
  useEffect(() => {
    // TODO: Replace with actual API calls
    // fetchStudentProjects(user?.id)
    // fetchStudentSubmissions(user?.id)

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [user?.id]);

  const stats = [
    {
      title: "Đề tài tham gia",
      value: enrolledProjects.length,
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
    {
      title: "Đã nộp",
      value: mySubmissions.filter((s) => s.status === "submitted").length,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
      description: "Bài nộp đã gửi",
    },
  ];

  const getProjectStatusBadge = (status: string) => {
    const label =
      PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] ||
      status;
    const className =
      PROJECT_STATUS_COLORS[status as keyof typeof PROJECT_STATUS_COLORS] ||
      "bg-gray-100 text-gray-700";

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${className}`}>
        {label}
      </span>
    );
  };

  const getSubmissionStatusBadge = (status: string) => {
    const label =
      SUBMISSION_STATUS_LABELS[
        status as keyof typeof SUBMISSION_STATUS_LABELS
      ] || status;
    const className =
      SUBMISSION_STATUS_COLORS[
        status as keyof typeof SUBMISSION_STATUS_COLORS
      ] || "bg-gray-100 text-gray-700";

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${className}`}>
        {label}
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-xl transition-all duration-200 hover:scale-[1.03]"
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
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Đề tài của tôi</CardTitle>
          <CardDescription>Các đề tài bạn đang tham gia</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {enrolledProjects.length === 0 ? (
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
              enrolledProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{project.title}</p>
                      {getProjectStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        Tạo:{" "}
                        {new Date(project.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                      <span>
                        Hạn:{" "}
                        {new Date(project.expiredAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                  <Link href={`/student/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Submissions */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Bài nộp của tôi</CardTitle>
          <CardDescription>Lịch sử bài nộp và trạng thái</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {mySubmissions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-muted-foreground">Chưa có bài nộp nào</p>
              </div>
            ) : (
              mySubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{submission.projectTitle}</p>
                      {submission.status &&
                        getSubmissionStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nộp lúc:{" "}
                      {new Date(submission.submittedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    {submission.reportLink && (
                      <a
                        href={submission.reportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Xem báo cáo
                      </a>
                    )}
                  </div>
                  <Link href={`/student/submissions/${submission.id}`}>
                    <Button variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
