"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Eye,
  FileIcon,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useStudentSubmission } from "@/hooks/useStudentSubmission";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/project-helpers";

export default function StudentSubmissionsPage() {
  const { submissions, isLoading } = useStudentSubmission();

  const getStatusBadge = (submission: any) => {
    if (submission.grade) {
      return (
        <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100 font-medium gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          Đã chấm điểm
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100 font-medium gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        Đang chờ chấm
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8.5) {
      return "bg-green-500 text-white border-green-600";
    } else if (score >= 7) {
      return "bg-yellow-500 text-white border-yellow-600";
    } else if (score >= 5) {
      return "bg-orange-500 text-white border-orange-600";
    }
    return "bg-red-500 text-white border-red-600";
  };

  const getFileExtension = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf")
      return { label: "PDF", color: "bg-red-100 text-red-700 border-red-200" };
    if (ext === "doc" || ext === "docx")
      return {
        label: "DOCX",
        color: "bg-blue-100 text-blue-700 border-blue-200",
      };
    return {
      label: "FILE",
      color: "bg-gray-100 text-gray-700 border-gray-200",
    };
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
              <div className="max-w-6xl mx-auto">
                {isLoading ? (
                  <Card className="shadow-sm border-gray-200">
                    <CardContent className="p-6">
                      <Skeleton className="h-12 w-full mb-4" />
                      <Skeleton className="h-16 w-full mb-2" />
                      <Skeleton className="h-16 w-full mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ) : submissions.length === 0 ? (
                  <Card className="shadow-md border-gray-200 bg-white">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                        <FileText className="w-10 h-10 text-gray-400" />
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
                  <Card className="shadow-lg border-gray-200 bg-white overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 bg-linear-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Lịch sử nộp bài
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Tổng cộng {submissions.length} bài nộp
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Table */}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                          <TableHead className="font-semibold text-gray-700 pl-6">
                            Tên đề tài
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 w-[140px]">
                            Ngày nộp
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 w-[120px]">
                            File đính kèm
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 w-40 text-center">
                            Trạng thái / Điểm
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 w-[120px] text-right pr-6">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => {
                          const fileInfo = getFileExtension(
                            submission.reportLink || ""
                          );

                          return (
                            <TableRow
                              key={submission.id}
                              className="group hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-0"
                            >
                              {/* Tên đề tài */}
                              <TableCell className="pl-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate max-w-[280px]">
                                      {submission.projectTitle ||
                                        "Không có tiêu đề"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Ngày nộp */}
                              <TableCell className="py-4">
                                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>
                                    {formatDateTime(submission.submittedAt)}
                                  </span>
                                </div>
                              </TableCell>

                              {/* File đính kèm */}
                              <TableCell className="py-4">
                                <a
                                  href={submission.reportLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium hover:opacity-80 transition-opacity"
                                  style={{ backgroundColor: "transparent" }}
                                >
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${fileInfo.color} border`}
                                  >
                                    <FileIcon className="w-3 h-3" />
                                    {fileInfo.label}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                </a>
                              </TableCell>

                              {/* Trạng thái / Điểm */}
                              <TableCell className="py-4 text-center">
                                {submission.grade ? (
                                  <div className="flex items-center justify-center gap-3">
                                    <div
                                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg ${getScoreBadge(
                                        submission.grade.score
                                      )} border shadow-sm`}
                                    >
                                      {submission.grade.score}
                                    </div>
                                    <div className="text-left">
                                      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100 text-[10px] px-2 py-0.5">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Đã chấm
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100 font-medium gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Đang chờ chấm
                                  </Badge>
                                )}
                              </TableCell>

                              {/* Hành động */}
                              <TableCell className="py-4 text-right pr-6">
                                <Link
                                  href={`/student/submissions/${submission.id}`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 text-gray-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
                                  >
                                    <Eye className="w-4 h-4" />
                                    {submission.grade
                                      ? "Xem đánh giá"
                                      : "Chi tiết"}
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
