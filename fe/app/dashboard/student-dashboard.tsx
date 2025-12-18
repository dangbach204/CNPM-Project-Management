"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, FileText, Clock, Inbox, User, Calendar } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import useStudentOverview from "@/hooks/useStudentOverview";
import { StudentOverview } from "@/types/student";
import { formatDate } from "@/lib/project-helpers";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { isLoading, overview } = useStudentOverview();

  const myProject = overview?.myProject || [];
  const mySubmissions = overview?.mySubmissions || [];

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

  const getDeadlineStatus = (expireAt: string) => {
    const now = new Date();
    const deadline = new Date(expireAt);
    const daysLeft = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0)
      return {
        status: "expired",
        color: "bg-red-500 text-white",
        text: "Đã hết hạn",
      };
    if (daysLeft <= 3)
      return {
        status: "urgent",
        color: "bg-red-100 text-red-700 border-red-300",
        text: `Còn ${daysLeft} ngày`,
      };
    if (daysLeft <= 7)
      return {
        status: "warning",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        text: `Còn ${daysLeft} ngày`,
      };
    return {
      status: "normal",
      color: "bg-green-100 text-green-700",
      text: `Còn ${daysLeft} ngày`,
    };
  };

  const getProjectStatusBadge = (status: string) => {
    return (
      <Badge className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-xs font-medium">
        Đang thực hiện
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score > 8.5) return { bg: "bg-green-500", text: "text-white" };
    if (score >= 7) return { bg: "bg-yellow-500", text: "text-white" };
    return { bg: "bg-red-500", text: "text-white" };
  };

  const getSubmissionStatusBadge = (
    grade: { score: number; feedback: string } | null
  ) => {
    if (!grade) {
      return (
        <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-3 py-1">
          Chờ chấm điểm
        </Badge>
      );
    }
    const colors = getScoreColor(grade.score);
    return (
      <Badge className={`${colors.bg} ${colors.text} px-3 py-1`}>
        Đã chấm: {grade.score}/10
      </Badge>
    );
  };

  const SkeletonCard = () => (
    <Card className="overflow-hidden bg-white shadow-md">
      <CardHeader className="bg-linear-to-r from-gray-100 to-gray-50 border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 min-h-screen bg-[#f8fafc]">
        {/* Header Skeleton */}
        <header className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </header>

        {/* Stats Skeleton */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-white shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-12 w-20" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="w-14 h-14 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Cards Skeleton */}
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div
      className="p-8 space-y-8 min-h-screen relative"
      style={{
        backgroundImage: "url(/bkhoa1.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay with blur effect */}
      <div className="fixed inset-0 bg-white/85 dark:bg-black/85 backdrop-blur-md -z-10"></div>

      {/* Main content wrapper with proper background */}
      <div className="relative z-0 bg-[#f8fafc]/95 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <header className="space-y-2 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Trang Chủ Sinh Viên
          </h1>
          <p className="text-lg text-muted-foreground">
            Chào mừng{" "}
            <span className="font-semibold text-blue-600">
              {user?.fullName}
            </span>
            , theo dõi tiến độ học tập của bạn
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl text-gray-700 font-bold leading-relaxed">
                        {stat.title}
                      </p>
                      <p className="text-5xl font-extrabold mt-2 text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${stat.color} shadow-sm`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Enrolled Projects */}
        <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow border-0 mb-8">
          <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Đề tài của tôi</span>
                </CardTitle>
                <CardDescription className="mt-2 ml-12">
                  Các đề tài bạn đang tham gia
                </CardDescription>
              </div>
              {myProject.length > 0 && (
                <Link href="/student/projects">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    Xem tất cả
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {myProject.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-linear-to-b from-gray-50 to-white rounded-xl">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Inbox className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-600">
                      Bạn chưa tham gia đề tài nào
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hãy tìm và đăng ký đề tài phù hợp với bạn
                    </p>
                  </div>
                  <Link href="/student/projects">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6">
                      Tìm Đề tài
                    </Button>
                  </Link>
                </div>
              ) : (
                myProject
                  .slice(0, 3)
                  .map((project: StudentOverview["myProject"][0]) => (
                    <div
                      key={project.projectId}
                      className="p-5 border rounded-xl hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      {/* Two-column layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Title, Status, Description */}
                        <div className="space-y-3">
                          <Link
                            href={`/student/projects/${project.projectId}`}
                            className="block"
                          >
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                              {project.title}
                            </h3>
                          </Link>
                          <div>{getProjectStatusBadge("")}</div>
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {/* Right Column: Teacher, Join Date, Deadline */}
                        <div className="space-y-3 lg:border-l lg:pl-6">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                GVHD
                              </p>
                              <p className="font-medium text-gray-700">
                                Đang cập nhật
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Ngày tham gia
                              </p>
                              <p className="font-medium text-gray-700">
                                {formatDate(project.joinedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Clock className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Deadline
                              </p>
                              <p className="font-medium text-gray-700">
                                Đang cập nhật
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Submissions */}
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-0 rounded-xl">
          <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Bài nộp của tôi</span>
                </CardTitle>
                <CardDescription className="mt-2 ml-12">
                  Lịch sử bài nộp và trạng thái
                </CardDescription>
              </div>
              {mySubmissions.length > 0 && (
                <Link href="/student/submissions">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 hover:border-green-300"
                  >
                    Xem tất cả
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {mySubmissions.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-linear-to-b from-gray-50 to-white rounded-xl">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-600">
                      Chưa có bài nộp nào
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hãy nộp bài cho đề tài bạn đang tham gia
                    </p>
                  </div>
                  {myProject.length > 0 && (
                    <Link href="/student/projects">
                      <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6">
                        Nộp bài cho đề tài
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                mySubmissions.slice(0, 3).map((submission) => (
                  <Link
                    key={submission.submissionId}
                    href={`/student/submissions/${submission.submissionId}`}
                    className="block"
                  >
                    <div className="p-5 border rounded-xl hover:bg-green-50/50 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                              {submission.title}
                            </h3>
                            {getSubmissionStatusBadge(submission.grade)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700 hover:bg-green-100"
                          >
                            Chi tiết →
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {submission.description}
                        </p>
                        <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
                          <div className="p-1.5 bg-gray-100 rounded">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span>
                            Nộp lúc:{" "}
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {submission.reportLink && (
                          <div className="mt-3">
                            <span
                              role="button"
                              tabIndex={0}
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(
                                  submission.reportLink,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(
                                    submission.reportLink,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                }
                              }}
                            >
                              📎 Xem báo cáo
                            </span>
                          </div>
                        )}
                        {submission.grade && submission.grade.feedback && (
                          <div className="mt-3 p-3 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg text-sm border">
                            <p className="font-semibold text-gray-700">
                              Nhận xét:
                            </p>
                            <p className="text-gray-600 mt-1 leading-relaxed">
                              {submission.grade.feedback}
                            </p>
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
    </div>
  );
}
