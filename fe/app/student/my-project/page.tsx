"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  FileText,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMyProject } from "@/hooks/useMyProject";
import { useStudentSubmission } from "@/hooks/useStudentSubmission";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function MyProjectPage() {
  const { isLoading, myProject } = useMyProject();
  const { submitLoading, handleSubmitProject } = useStudentSubmission();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [reportLink, setReportLink] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = (expireAt: string) => {
    return new Date(expireAt) < new Date();
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Đang tải...</p>
                </div>
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
                  Đề tài của tôi
                </h1>
                <p className="text-white/85 text-[13px] sm:text-sm font-medium">
                  Quản lý và theo dõi tiến độ đề tài của bạn
                </p>
              </div>
            </div>

              {/* Project Details */}
              {!myProject ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Chưa có đề tài
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Bạn chưa tham gia đề tài nào. Hãy vào trang Đề tài để chọn
                      và tham gia một đề tài phù hợp.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                  <div className="space-y-6">
                    {/* Main Project Overview Card */}
                    <Card className="shadow-lg border-gray-300/80">
                      <CardContent className="p-6 sm:p-8">
                        {/* Header with Title and Status */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight tracking-tight flex-1">
                              {myProject.title}
                            </h2>
                            <div>
                              {isExpired(myProject.expireAt) ? (
                                <Badge
                                  variant="destructive"
                                  className="text-[11px] px-3 py-1"
                                >
                                  Đã hết hạn
                                </Badge>
                              ) : (
                                <Badge
                                  variant="default"
                                  className="text-[11px] px-3 py-1 bg-emerald-600"
                                >
                                  Đang hoạt động
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-[14px] text-gray-600 leading-relaxed">
                            {myProject.description}
                          </p>
                        </div>

                        {/* 2-Column Layout: Info + Actions */}
                        <div className="grid md:grid-cols-[1fr,auto] gap-8">
                          {/* Left: Project Information */}
                          <div className="space-y-5">
                            {/* Deadline - Most Important */}
                            <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                  <AlertCircle className="w-5 h-5 text-amber-700" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[11px] uppercase tracking-wide text-amber-700 font-semibold mb-1">
                                    Hạn hoàn thành
                                  </p>
                                  <p className="text-lg font-bold text-amber-900">
                                    {formatDate(myProject.expireAt)}
                                  </p>
                                  {!isExpired(myProject.expireAt) && (
                                    <p className="text-[12px] text-amber-700 mt-1">
                                      Còn{" "}
                                      {Math.ceil(
                                        (new Date(
                                          myProject.expireAt
                                        ).getTime() -
                                          new Date().getTime()) /
                                          (1000 * 60 * 60 * 24)
                                      )}{" "}
                                      ngày
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Other Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Supervisor */}
                              <div className="space-y-2">
                                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-gray-400" />
                                  Giảng viên hướng dẫn
                                </p>
                                <p className="text-[15px] font-semibold text-gray-900">
                                  {myProject.teacher?.name ||
                                    "Chưa có thông tin"}
                                </p>
                              </div>

                              {/* Joined Date */}
                              <div className="space-y-2">
                                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  Ngày tham gia
                                </p>
                                <p className="text-[15px] font-semibold text-gray-900">
                                  {formatDate(myProject.joinedAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right: Primary Action */}
                          <div className="md:border-l md:border-gray-200 md:pl-8">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                  Hành động
                                </h3>
                                <p className="text-[12px] text-gray-600 mb-4">
                                  Nộp báo cáo tiến độ hoặc báo cáo cuối kỳ
                                </p>
                              </div>
                              <Button
                                onClick={() => setSubmitDialogOpen(true)}
                                disabled={isExpired(myProject.expireAt)}
                                className="w-full h-12 text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                size="lg"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Nộp báo cáo
                              </Button>
                              {isExpired(myProject.expireAt) && (
                                <p className="text-[11px] text-red-600 text-center">
                                  Đề tài đã hết hạn
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

              {/* Submit Report Dialog */}
              <Dialog
                open={submitDialogOpen}
                onOpenChange={setSubmitDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nộp báo cáo hoặc báo cáo tiến độ</DialogTitle>
                    <DialogDescription>
                      Nhập link báo cáo tiến độ của bạn (Google Drive, OneDrive,
                      GitHub, ...)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportLink">Link báo cáo</Label>
                      <Input
                        id="reportLink"
                        placeholder="https://drive.google.com/..."
                        value={reportLink}
                        onChange={(e) => setReportLink(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmitDialogOpen(false);
                        setReportLink("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={async () => {
                        if (myProject && reportLink.trim()) {
                          const success = await handleSubmitProject(
                            myProject.projectId,
                            reportLink.trim()
                          );
                          if (success) {
                            setSubmitDialogOpen(false);
                            setReportLink("");
                          }
                        }
                      }}
                      disabled={submitLoading || !reportLink.trim()}
                    >
                      {submitLoading ? "Đang nộp..." : "Nộp báo cáo"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
