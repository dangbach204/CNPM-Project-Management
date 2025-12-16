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
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              <div>
                <h1 className="text-3xl font-bold">Bài nộp của tôi</h1>
                <p className="text-muted-foreground mt-2">
                  Theo dõi tất cả bài nộp và điểm số
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Bạn chưa nộp bài nào
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {submissions.map((submission) => {
                    return (
                      <Card
                        key={submission.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {submission.projectTitle ||
                                    "Không có tiêu đề"}
                                </h3>
                              </div>

                              <p className="text-muted-foreground mb-3">
                                {submission.projectDescription ||
                                  "Không có mô tả"}
                              </p>

                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Link báo cáo
                                  </p>
                                  <a
                                    href={submission.reportLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary hover:underline"
                                  >
                                    Xem báo cáo
                                  </a>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Ngày nộp
                                  </p>
                                  <p className="font-medium">
                                    {new Date(
                                      submission.submittedAt
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                                {submission.grade && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Điểm
                                    </p>
                                    <p className="font-medium text-lg text-primary">
                                      {submission.grade.score}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Link
                                href={`/student/submissions/${submission.id}`}
                              >
                                <button className="text-sm text-primary hover:underline">
                                  Xem chi tiết
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
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
