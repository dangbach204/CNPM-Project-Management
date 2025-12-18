"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminLogs } from "@/hooks/useAdminLogs";
import { Log } from "@/types/admin";
import {
  FileText,
  User,
  FolderOpen,
  Activity,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileCheck,
} from "lucide-react";
import { LogItem } from "@/components/admin/LogItem";
import { LogActionBadge } from "@/components/admin/LogActionBadge";
import { formatDateTime } from "@/lib/project-helpers";

export default function AdminReportsPage() {
  const { user } = useAuthStore();
  const { logs, isLoading, currentPage, totalPages, totalLogs, goToPage } =
    useAdminLogs();
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const logsArray = Array.isArray(logs) ? logs : [];

  const handlePageChange = (page: number) => {
    goToPage(page, 10);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogClick = (log: Log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "user":
        return <User className="h-4 w-4" />;
      case "project":
        return <FolderOpen className="h-4 w-4" />;
      case "submission":
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto relative">
            {/* BACKGROUND WRAPPER */}
            <div className="absolute top-0 left-0 w-full h-full min-h-full overflow-hidden z-0 pointer-events-none">
              {/* Blurred background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/bkhoa2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                  filter: "blur(10px)",
                  opacity: 0.6,
                  transform: "scale(1.1)",
                }}
              />

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.95) 55%)",
                }}
              />
            </div>

            <div className="relative z-10 min-h-full p-6 space-y-6 max-w-[1600px] mx-auto">
              {/* Page Header */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Nhật ký Hệ thống
                </h1>
                <p className="text-muted-foreground mt-1">
                  Theo dõi và kiểm tra tất cả hoạt động trong hệ thống
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                      Đang tải nhật ký...
                    </p>
                  </div>
                </div>
              )}

              {/* Logs Summary */}
              {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">
                            Tổng số Log
                          </p>
                          <p className="text-3xl font-bold mt-2">{totalLogs}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                          <Activity className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">
                            Trang hiện tại
                          </p>
                          <p className="text-3xl font-bold mt-2">
                            {currentPage} / {totalPages}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">
                            Logs trên trang
                          </p>
                          <p className="text-3xl font-bold mt-2">
                            {logsArray.length}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                          <FileCheck className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">
                            Tổng trang
                          </p>
                          <p className="text-3xl font-bold mt-2">
                            {totalPages}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                          <FileText className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Logs Table */}
              {!isLoading && logsArray.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        Danh sách Nhật ký
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Hiển thị{" "}
                        <span className="font-semibold text-foreground">
                          {(currentPage - 1) * 10 + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-semibold text-foreground">
                          {Math.min(currentPage * 10, totalLogs)}
                        </span>{" "}
                        trong tổng số{" "}
                        <span className="font-semibold text-foreground">
                          {totalLogs}
                        </span>{" "}
                        nhật ký
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {logsArray.map((log) => (
                        <LogItem
                          key={log.id}
                          log={log}
                          onClick={handleLogClick}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t">
                        <div className="text-sm text-muted-foreground">
                          Trang {currentPage} / {totalPages}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Trước
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => {
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 &&
                                  page <= currentPage + 1)
                              ) {
                                return (
                                  <Button
                                    key={page}
                                    variant={
                                      currentPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                    className="w-10"
                                  >
                                    {page}
                                  </Button>
                                );
                              } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                              ) {
                                return (
                                  <span
                                    key={page}
                                    className="px-2 text-muted-foreground"
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="gap-1"
                          >
                            Sau
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!isLoading && logsArray.length === 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-16">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <Activity className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Chưa có nhật ký
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Các hoạt động trong hệ thống sẽ được ghi lại tại đây
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết Nhật ký</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về hoạt động #{selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Hành động
                  </p>
                  <LogActionBadge action={selectedLog.action} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Loại đối tượng
                  </p>
                  <div className="flex items-center gap-2">
                    {getEntityIcon(selectedLog.entityType)}
                    <span className="font-semibold">
                      {selectedLog.entityType}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  ID đối tượng
                </p>
                <p className="font-mono text-sm bg-muted/50 px-3 py-2 rounded">
                  {selectedLog.entityId}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Thời gian
                </p>
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {formatDateTime(selectedLog.createdAt)}
                  </p>
                </div>
              </div>

              {selectedLog.ipAddress && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Địa chỉ IP
                  </p>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Chi tiết
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap wrap-break-word">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
