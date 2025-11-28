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
} from "lucide-react";

export default function AdminReportsPage() {
  const { user } = useAuthStore();
  const { logs, isLoading } = useAdminLogs();
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure logs is always an array
  const logsArray = Array.isArray(logs) ? logs : [];

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

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes("create") || lowerAction.includes("add")) {
      return "bg-green-100 text-green-700 border-green-200";
    } else if (lowerAction.includes("update") || lowerAction.includes("edit")) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    } else if (
      lowerAction.includes("delete") ||
      lowerAction.includes("remove")
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    } else if (
      lowerAction.includes("login") ||
      lowerAction.includes("logout")
    ) {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main 
            className="flex-1 overflow-y-auto"
            style={{
              backgroundImage: 'url(/bkhoa1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="p-8 space-y-8">
              <div>
                <h1 className="text-3xl font-bold">Nhật ký Hệ thống</h1>
                <p className="text-muted-foreground mt-2">
                  Theo dõi tất cả các hoạt động trong hệ thống
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
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Tổng số Log
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {logsArray.length}
                          </p>
                        </div>
                        <Activity className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Người dùng
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {
                              logsArray.filter(
                                (l) => l.entityType?.toLowerCase() === "user"
                              ).length
                            }
                          </p>
                        </div>
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Bài nộp
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {
                              logsArray.filter(
                                (l) =>
                                  l.entityType?.toLowerCase() === "submission"
                              ).length
                            }
                          </p>
                        </div>
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Bài nộp
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {
                              logsArray.filter(
                                (l) =>
                                  l.entityType?.toLowerCase() === "submission"
                              ).length
                            }
                          </p>
                        </div>
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Logs Table */}
              {!isLoading && logsArray.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách Nhật ký</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {logsArray.map((log) => (
                        <div
                          key={log.id}
                          onClick={() => handleLogClick(log)}
                          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">
                                {getEntityIcon(log.entityType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Badge className={getActionColor(log.action)}>
                                    {log.action}
                                  </Badge>
                                  <Badge variant="outline">
                                    {log.entityType}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ID: {log.entityId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDate(log.createdAt)}</span>
                                  </div>
                                  {log.ipAddress && (
                                    <div className="flex items-center gap-1">
                                      <Globe className="h-3 w-3" />
                                      <span>{log.ipAddress}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!isLoading && logsArray.length === 0 && (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Chưa có nhật ký
                      </h3>
                      <p className="text-muted-foreground">
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Hành động
                  </p>
                  <Badge className={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Loại đối tượng
                  </p>
                  <div className="flex items-center gap-2">
                    {getEntityIcon(selectedLog.entityType)}
                    <span className="font-medium">
                      {selectedLog.entityType}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  ID đối tượng
                </p>
                <p className="font-mono text-sm">{selectedLog.entityId}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Thời gian
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>

              {selectedLog.ipAddress && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Địa chỉ IP
                  </p>
                  <div className="flex items-center gap-2">
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
