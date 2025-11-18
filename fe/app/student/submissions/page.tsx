"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { mockSubmissions, mockProjects, mockGrades } from "@/lib/mock-data";
import { FileText, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function StudentSubmissionsPage() {
  const { user } = useAuthStore();

  const mySubmissions = user
    ? mockSubmissions.filter((s) => s.studentId === user.id.toString())
    : [];

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
      case "submitted":
        return "Đã nộp";
      case "reviewed":
        return "Đã xem";
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
      case "submitted":
        return "bg-yellow-100 text-yellow-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
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

              {mySubmissions.length === 0 ? (
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
                  {mySubmissions.map((submission) => {
                    const project = mockProjects.find(
                      (p) => p.id === submission.projectId
                    );
                    const grade = mockGrades.find(
                      (g) => g.submissionId === submission.id
                    );

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
                                  {submission.title}
                                </h3>
                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                                    submission.status
                                  )}`}
                                >
                                  {getStatusLabel(submission.status)}
                                </span>
                              </div>

                              <p className="text-muted-foreground mb-3">
                                {submission.description}
                              </p>

                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Đề tài
                                  </p>
                                  <p className="font-medium">
                                    {project?.title}
                                  </p>
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
                                {grade && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Điểm
                                    </p>
                                    <p className="font-medium text-lg text-primary">
                                      {grade.score}/{grade.maxScore}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {grade && (
                                <div className="bg-muted p-4 rounded-lg">
                                  <p className="text-sm font-medium mb-2">
                                    Nhận xét từ giáo viên:
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {grade.feedback}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {getStatusIcon(submission.status)}
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
