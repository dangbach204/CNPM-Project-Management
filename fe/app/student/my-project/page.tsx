"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, Clock, Send } from "lucide-react";
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
          <main className="flex-1 overflow-y-auto relative" style={{
            backgroundImage: 'url(/bkhoa2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl -z-10"></div>
            <div className="container mx-auto p-6 space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Đề tài của tôi
                </h1>
                <p className="text-muted-foreground mt-2">
                  Thông tin chi tiết về đề tài bạn đang tham gia
                </p>
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
                  {/* Main Project Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-2xl">
                            {myProject.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {myProject.status === "expired" || isExpired(myProject.expireAt) ? (
                              <Badge variant="destructive">Hết hạn</Badge>
                            ) : myProject.status === "completed" ? (
                              <Badge className="bg-green-600 hover:bg-green-700">Hoàn thành</Badge>
                            ) : myProject.status === "approved" ? (
                              <Badge className="bg-blue-600 hover:bg-blue-700">Đã phê duyệt</Badge>
                            ) : myProject.status === "rejected" ? (
                              <Badge variant="destructive">Đã từ chối</Badge>
                            ) : myProject.status === "pending" ? (
                              <Badge className="bg-yellow-600 hover:bg-yellow-700">Đang thực hiện</Badge>
                            ) : myProject.status === "available" ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-700">Mở</Badge>
                            ) : (
                              <Badge variant="secondary">Trống</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => setSubmitDialogOpen(true)}
                          disabled={isExpired(myProject.expireAt)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Nộp báo cáo hoặc báo cáo tiến độ
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Mô tả
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {myProject.description}
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        {/* Teacher */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Giảng viên hướng dẫn
                          </h3>
                          <p className="text-base font-medium">
                            {myProject.teacher?.name || "Chưa có thông tin"}
                          </p>
                        </div>

                        {/* Expiration Date */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Ngày hết hạn
                          </h3>
                          <p className="text-base font-medium">
                            {formatDate(myProject.expireAt)}
                          </p>
                        </div>

                        {/* Joined Date */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Ngày tham gia
                          </h3>
                          <p className="text-base font-medium">
                            {formatDate(myProject.joinedAt)}
                          </p>
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
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
