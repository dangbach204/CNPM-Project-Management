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
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/student/submissions")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold">Chi tiết bài nộp</h1>
                    <p className="text-muted-foreground mt-2">
                      Xem thông tin và kết quả chấm điểm
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!submission.grade)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      !!submission.grade
                    )}`}
                  >
                    {getStatusLabel(!!submission.grade)}
                  </span>
                </div>
              </div>

              <div className="grid gap-6">
                {/* Project Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Thông tin đồ án
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Tên đồ án
                      </p>
                      <p className="text-lg font-semibold">
                        {submission.projectTitle || "Không có tiêu đề"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Mô tả
                      </p>
                      <p className="text-base">
                        {submission.projectDescription || "Không có mô tả"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Submission Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Thông tin bài nộp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Link báo cáo
                        </p>
                        <a
                          href={submission.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Xem báo cáo
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Ngày nộp
                        </p>
                        <p className="font-medium">
                          {new Date(submission.submittedAt).toLocaleString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grade and Feedback */}
                {submission.grade ? (
                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Kết quả chấm điểm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="bg-primary/10 rounded-lg p-6 text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            Điểm số
                          </p>
                          <p className="text-5xl font-bold text-primary">
                            {submission.grade.score}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            Ngày chấm điểm
                          </p>
                          <p className="font-medium">
                            {new Date(submission.grade.gradedAt).toLocaleString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {submission.grade.feedback && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <p className="font-semibold">
                              Nhận xét từ giảng viên
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-base whitespace-pre-wrap">
                              {submission.grade.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 border-yellow-200">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                      <p className="text-lg font-semibold mb-2">
                        Đang chờ chấm điểm
                      </p>
                      <p className="text-muted-foreground">
                        Bài nộp của bạn đang được giảng viên xem xét. Vui lòng
                        quay lại sau.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
