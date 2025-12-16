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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
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
} from "lucide-react";

const LOGS_PER_PAGE = 15;

export default function AdminReportsPage() {
  const { user } = useAuthStore();
  const { logs, isLoading } = useAdminLogs();
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [idFilter, setIdFilter] = useState<string>("");

  // Ensure logs is always an array
  const logsArray = Array.isArray(logs) ? logs : [];

  // Get unique actions from logs
  const uniqueActions = useMemo(() => {
    const actions = new Set(logsArray.map(log => log.action));
    return Array.from(actions).sort();
  }, [logsArray]);

  // Filter logs by action, time, and ID
  const filteredLogs = useMemo(() => {
    let filtered = logsArray;

    // Filter by action
    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filter by time
    if (timeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      if (timeFilter === "today") {
        filterDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === "week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (timeFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate >= filterDate;
      });
    }

    // Filter by ID (search in entity ID only)
    if (idFilter.trim() !== "") {
      const searchId = idFilter.trim();
      filtered = filtered.filter(log => 
        log.entityId?.toString() === searchId
      );
    }

    return filtered;
  }, [logsArray, actionFilter, timeFilter, idFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
    const endIndex = startIndex + LOGS_PER_PAGE;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleActionFilterChange = (action: string) => {
    setActionFilter(action);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (time: string) => {
    setTimeFilter(time);
    setCurrentPage(1);
  };

  const handleIdFilterChange = (id: string) => {
    setIdFilter(id);
    setCurrentPage(1);
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

              {/* Filter Bar */}
              {!isLoading && logsArray.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Action Filter */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium whitespace-nowrap">Hành động:</label>
                        <Select value={actionFilter} onValueChange={handleActionFilterChange}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Chọn hành động" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Tất cả ({logsArray.length})
                            </SelectItem>
                            {uniqueActions.map((action) => {
                              const count = logsArray.filter(log => log.action === action).length;
                              return (
                                <SelectItem key={action} value={action}>
                                  {action} ({count})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Time Filter */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium whitespace-nowrap">Thời gian:</label>
                        <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Chọn thời gian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="today">Hôm nay</SelectItem>
                            <SelectItem value="week">7 ngày qua</SelectItem>
                            <SelectItem value="month">30 ngày qua</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* ID Filter */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium whitespace-nowrap">ID:</label>
                        <Input
                          type="text"
                          placeholder="Tìm theo ID..."
                          value={idFilter}
                          onChange={(e) => handleIdFilterChange(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Logs Table */}
              {!isLoading && logsArray.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Danh sách Nhật ký</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {((currentPage - 1) * LOGS_PER_PAGE) + 1} - {Math.min(currentPage * LOGS_PER_PAGE, filteredLogs.length)} trong tổng số {filteredLogs.length} nhật ký
                      {actionFilter !== "all" && ` (lọc: ${actionFilter})`}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {paginatedLogs.map((log) => (
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Trước
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className="w-10"
                                >
                                  {page}
                                </Button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <span key={page} className="px-2">...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
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
