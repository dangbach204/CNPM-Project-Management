"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useStudentSubmission } from "@/hooks/useStudentSubmission";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentSubmissionsPage() {
  const { submissions, isLoading } = useStudentSubmission();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "reviewed":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "submitted":
        return "Đã nộp";
      case "reviewed":
        return "Đã xem";
      case "graded":
        return "Đã chấm điểm";
      case "approved":
        return "Chấp nhận";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 8.5) {
      return "text-green-600";
    } else if (score >= 7) {
      return "text-yellow-600";
    } else {
      return "text-red-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "submitted":
        return "bg-yellow-100 text-yellow-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      case "graded":
        return "bg-green-100 text-green-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50/50">
            {/* Compact Banner */}
            <div className="relative h-36 sm:h-40 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url(/bkhoa2.jpg)",
                }}
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-black/70" />

              <div className="relative h-full flex flex-col justify-center px-6 sm:px-8 lg:px-12">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 tracking-tight">
                  Bài nộp của tôi
                </h1>
                <p className="text-white/85 text-[13px] sm:text-sm font-medium">
                  Theo dõi lịch sử nộp bài và kết quả đánh giá
                </p>
              </div>
            </div>

            <div className="px-6 sm:px-8 lg:px-12 py-8">
              <div className="max-w-5xl mx-auto">
                {isLoading ? (
                  <div className="grid gap-5">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="shadow-sm border-gray-300/80">
                        <CardContent className="p-5">
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <Card className="shadow-md border-gray-300/80">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        Chưa có bài nộp
                      </h3>
                      <p className="text-gray-600 text-center max-w-md text-[14px]">
                        Bạn chưa nộp báo cáo nào. Truy cập "Đề tài của tôi" để
                        nộp báo cáo.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-5">
                    {submissions.map((submission) => {
                      return (
                        <Card
                          key={submission.id}
                          className="group shadow-md shadow-gray-200/80 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300 border border-gray-300/80 bg-white"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-6">
                              {/* Left: Main Info */}
                              <div className="flex-1 min-w-0">
                                {/* Title */}
                                <h3 className="text-[17px] font-semibold text-gray-900 mb-2 leading-tight tracking-[-0.01em] truncate">
                                  {submission.projectTitle ||
                                    "Không có tiêu đề"}
                                </h3>

                                {/* Metadata Grid */}
                                <div className="flex items-center gap-6 text-[13px]">
                                  {/* Submission Date */}
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    <span>
                                      {new Date(
                                        submission.submittedAt
                                      ).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>

                                  {/* Report Link */}
                                  <a
                                    href={submission.reportLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Xem báo cáo</span>
                                  </a>
                                </div>
                              </div>

                              {/* Right: Score + CTA */}
                              <div className="flex items-center gap-4 shrink-0">
                                {/* Score Badge */}
                                {submission.grade ? (
                                  <div className="text-center">
                                    <div
                                      className={`text-3xl font-bold leading-none mb-1 ${
                                        submission.grade.score >= 8.5
                                          ? "text-green-600"
                                          : submission.grade.score >= 7
                                          ? "text-yellow-600"
                                          : submission.grade.score >= 5
                                          ? "text-orange-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {submission.grade.score}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">
                                      Điểm
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center px-3">
                                    <div className="text-sm font-medium text-gray-400">
                                      Chưa chấm
                                    </div>
                                  </div>
                                )}

                                {/* CTA */}
                                <Link
                                  href={`/student/submissions/${submission.id}`}
                                >
                                  <button className="px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-md hover:bg-gray-50 transition-all">
                                    {submission.grade
                                      ? "Xem đánh giá"
                                      : "Xem chi tiết"}
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
