"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  ArrowLeft,
  Star,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useStudentSubmission } from "@/hooks/useStudentSubmission";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { formatDateTime } from "@/lib/project-helpers";

export default function SubmissionDetailPage() {
  const { user } = useAuthStore();
  const { submissions, isLoading } = useStudentSubmission();
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const submission = useMemo(() => {
    return submissions.find((s) => s.id === parseInt(submissionId));
  }, [submissions, submissionId]);

  const getStatusIcon = (hasGrade: boolean) => {
    if (hasGrade) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusLabel = (hasGrade: boolean) => {
    if (hasGrade) {
      return "Đã chấm điểm";
    }
    return "Đang chờ chấm";
  };

  const getStatusColor = (hasGrade: boolean) => {
    if (hasGrade) {
      return "bg-green-100 text-green-700";
    }
    return "bg-yellow-100 text-yellow-700";
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                <Skeleton className="h-10 w-64" />
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!submission) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/student/submissions")}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Không tìm thấy bài nộp
                    </p>
                    <Button onClick={() => router.push("/student/submissions")}>
                      Quay lại danh sách
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50/50">
            <div className="p-6 sm:p-8 space-y-6">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/student/submissions")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại
                    </Button>
                    <div className="border-l border-gray-300 pl-3">
                      <h1 className="text-2xl font-bold tracking-tight">
                        Chi tiết bài nộp
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!submission.grade)}
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${getStatusColor(
                        !!submission.grade
                      )}`}
                    >
                      {getStatusLabel(!!submission.grade)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {/* Project & Submission Information - Combined */}
                  <Card className="shadow-md border-gray-300/80">
                    <CardContent className="p-6">
                      {/* Project Title */}
                      <div className="mb-5 pb-5 border-b border-gray-200">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-2">
                          Tên đồ án
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                          {submission.projectTitle || "Không có tiêu đề"}
                        </h2>
                        {submission.projectDescription && (
                          <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">
                            {submission.projectDescription}
                          </p>
                        )}
                      </div>

                      {/* Submission Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                            Link báo cáo
                          </p>
                          <a
                            href={submission.reportLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Xem báo cáo
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Ngày nộp
                          </p>
                          <p className="text-[14px] font-semibold text-gray-900">
                            {formatDateTime(submission.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grade and Feedback - Prominent */}
                  {submission.grade ? (
                    <Card className="shadow-lg border-2 border-green-300/60 bg-linear-to-br from-white to-green-50/30">
                      <CardContent className="p-6 sm:p-8">
                        {/* Score Display - Hero */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                              <Star className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1">
                                Kết quả chấm điểm
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-green-600">
                                  {submission.grade.score}
                                </span>
                                <span className="text-2xl text-gray-400 font-medium">
                                  /10
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 sm:border-l sm:border-gray-200 sm:pl-6">
                            <div className="space-y-1.5">
                              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                Ngày chấm điểm
                              </p>
                              <p className="text-[14px] font-semibold text-gray-900">
                                {formatDateTime(
                                  submission.grade.gradedAt,
                                  "Chưa có thông tin"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feedback */}
                        {submission.grade.feedback && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                              <p className="text-[13px] font-semibold text-gray-900 uppercase tracking-wide">
                                Nhận xét từ giảng viên
                              </p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {submission.grade.feedback}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-md border-2 border-yellow-300/60 bg-linear-to-br from-white to-yellow-50/30">
                      <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <p className="text-lg font-semibold mb-2 text-gray-900">
                          Đang chờ chấm điểm
                        </p>
                        <p className="text-[14px] text-gray-600 max-w-md mx-auto">
                          Bài nộp của bạn đang được giảng viên xem xét. Vui lòng
                          quây lại sau.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
