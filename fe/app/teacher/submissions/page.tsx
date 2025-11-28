"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Loader2, FileText, User, Calendar, Award } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useGetSubmissions } from "@/hooks/useGetSubmissions";

type Submission = {
  id: number;
  projectTitle: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  reportLink: string;
  score: string | null;
  feedback: string | null;
};

export default function TeacherSubmissionsPage() {
  const { submissions: submissionsResponse, isLoading } = useGetSubmissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const submissions: Submission[] = Array.isArray(submissionsResponse)
    ? submissionsResponse
    : (submissionsResponse as any)?.submissions || [];
  const totalSubmissions = Array.isArray(submissionsResponse)
    ? submissionsResponse.length
    : (submissionsResponse as any)?.totalSubmissions || 0;

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.projectTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const isGraded =
      submission.score !== null && submission.score !== undefined;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "graded" && isGraded) ||
      (statusFilter === "not_graded" && !isGraded);

    return matchesSearch && matchesStatus;
  });

  const gradedCount = submissions.filter(
    (s) => s.score !== null && s.score !== undefined
  ).length;
  const notGradedCount = submissions.length - gradedCount;

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (submission: Submission) => {
    const isGraded =
      submission.score !== null && submission.score !== undefined;
    if (isGraded) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
          Đã chấm
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">
        Chưa chấm
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50/50">
            <div className="p-8 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground font-medium">
                      Tổng bài nộp
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {totalSubmissions}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground font-medium">
                      Đã chấm
                    </p>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                      {gradedCount}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground font-medium">
                      Chưa chấm
                    </p>
                    <p className="text-3xl font-bold mt-2 text-yellow-600">
                      {notGradedCount}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên dự án hoặc sinh viên..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="graded">Đã chấm</SelectItem>
                    <SelectItem value="not_graded">Chưa chấm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submission Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubmissions.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    Không tìm thấy bài nộp nào
                  </div>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewDetails(submission)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-1">
                              {submission.projectTitle}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {submission.studentName}
                            </CardDescription>
                          </div>
                          {getStatusBadge(submission)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(submission.submittedAt).toLocaleString(
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
                          {submission.score && (
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                              <Award className="h-4 w-4" />
                              <span>Điểm: {submission.score}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết bài nộp</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về bài nộp của sinh viên
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dự án
                </h3>
                <p className="text-lg">{selectedSubmission.projectTitle}</p>
              </div>

              {/* Student Info */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sinh viên
                </h3>
                <div className="space-y-1">
                  <p className="text-lg font-medium">
                    {selectedSubmission.studentName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.studentEmail}
                  </p>
                </div>
              </div>

              {/* Submission Date */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ngày giờ nộp
                </h3>
                <p>
                  {new Date(selectedSubmission.submittedAt).toLocaleString(
                    "vi-VN",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }
                  )}
                </p>
              </div>

              {/* Grade Info */}
              {selectedSubmission.score && (
                <div className="space-y-2 border-t pt-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Đánh giá
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Điểm số:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {selectedSubmission.score}
                      </span>
                    </div>
                    {selectedSubmission.feedback && (
                      <div>
                        <span className="font-semibold">Nhận xét:</span>
                        <p className="mt-1 text-muted-foreground">
                          {selectedSubmission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Navigate to grading page or open grading form
                    window.location.href = `/teacher/submissions/${selectedSubmission.id}/grade`;
                  }}
                >
                  {selectedSubmission.score ? "Chỉnh sửa điểm" : "Chấm điểm"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(selectedSubmission.reportLink, "_blank")
                  }
                >
                  Xem báo cáo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
