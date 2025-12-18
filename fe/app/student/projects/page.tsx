"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  Calendar,
  Clock,
  UserCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useStudentProjects } from "@/hooks/useStudentProjects";
import { formatDate } from "@/lib/project-helpers";

interface Project {
  id: number;
  title: string;
  description: string;
  teacherName: string | null;
  studentCount: string;
  maxStudents?: number;
  createdAt: string;
  expiredAt: string;
}

interface StudentProjectCardProps {
  project: Project;
  isEnrolled: boolean;
  expired: boolean;
  onJoin?: (projectId: number) => void;
  joinLoading?: boolean;
}

function StudentProjectCard({
  project,
  isEnrolled,
  expired,
  onJoin,
  joinLoading,
}: StudentProjectCardProps) {
  const parseStudentCount = (countStr: string) => {
    const match = countStr.match(/(\d+)\/(\d+)/);
    if (match) {
      return { current: parseInt(match[1]), max: parseInt(match[2]) };
    }
    return { current: 0, max: 1 };
  };

  const studentSlots = parseStudentCount(project.studentCount);
  const slotPercentage = (studentSlots.current / studentSlots.max) * 100;
  const isFull = studentSlots.current >= studentSlots.max;

  const getAccentColor = () => {
    if (isEnrolled) return "from-blue-500 to-blue-600";
    if (expired) return "from-gray-400 to-gray-500";
    return "from-emerald-500 to-teal-500";
  };

  return (
    <Card className="group relative shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 hover:border-gray-300 bg-white overflow-hidden">
      {/* Left accent border */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b ${getAccentColor()}`}
      />

      <div className="pl-5">
        {/* Card Header */}
        <div className="px-5 pt-5 pb-4 bg-linear-to-br from-slate-50/90 via-white to-white border-b border-gray-100">
          {/* Header: Title + Status Badge */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-[1.35] flex-1 tracking-[-0.02em] group-hover:text-gray-800">
              {project.title}
            </h3>
            <div className="shrink-0">
              {isEnrolled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã tham gia
                </span>
              )}
              {expired && !isEnrolled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 shadow-sm">
                  <XCircle className="w-3.5 h-3.5" />
                  Đã hết hạn
                </span>
              )}
              {!expired && !isEnrolled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Đang mở
                </span>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-5 pt-4">
          {/* Description - 2 lines max */}
          <p className="text-[13px] sm:text-sm text-gray-600 leading-relaxed mb-5 line-clamp-2 min-h-10">
            {project.description}
          </p>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Expired Date */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <div
                className={`p-2 rounded-lg ${
                  expired ? "bg-gray-200" : "bg-amber-100"
                }`}
              >
                <Clock
                  className={`w-4 h-4 ${
                    expired ? "text-gray-500" : "text-amber-600"
                  }`}
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                  Hết hạn
                </p>
                <p
                  className={`text-sm font-semibold ${
                    expired ? "text-gray-500" : "text-amber-600"
                  }`}
                >
                  {project.expiredAt
                    ? formatDate(project.expiredAt)
                    : "Không giới hạn"}
                </p>
              </div>
            </div>

            {/* Supervisor */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <div className="p-2 rounded-lg bg-indigo-100">
                <UserCircle className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                  Giảng viên
                </p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {project.teacherName || "Chưa có"}
                </p>
              </div>
            </div>
          </div>

          {/* Student Slots with Progress Bar */}
          <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${
                    isFull ? "bg-orange-100" : "bg-emerald-100"
                  }`}
                >
                  <Users
                    className={`w-3.5 h-3.5 ${
                      isFull ? "text-orange-600" : "text-emerald-600"
                    }`}
                  />
                </div>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                  Số sinh viên
                </span>
              </div>
              <span
                className={`text-sm font-bold ${
                  isFull ? "text-orange-600" : "text-gray-900"
                }`}
              >
                {project.studentCount}
              </span>
            </div>
            <Progress
              value={slotPercentage}
              className={`h-2 ${
                isFull ? "[&>div]:bg-orange-500" : "[&>div]:bg-emerald-500"
              }`}
            />
            {isFull && (
              <p className="text-[10px] text-orange-600 mt-1.5 font-medium">
                Đã đủ thành viên
              </p>
            )}
          </div>

          {/* Created Date - Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px]">
                Tạo lúc: {formatDate(project.createdAt)}
              </span>
            </div>
          </div>

          {/* Join Project Button */}
          {!isEnrolled && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Button
                onClick={() => onJoin?.(project.id)}
                disabled={expired || isFull || joinLoading}
                className={`w-full h-10 text-sm font-semibold transition-all ${
                  expired || isFull
                    ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {joinLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Đang tham gia...
                  </span>
                ) : expired ? (
                  "Đã hết hạn"
                ) : isFull ? (
                  "Đã đủ thành viên"
                ) : (
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Tham gia đề tài
                  </span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

export default function StudentProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const {
    isLoading,
    projects,
    myProjectIds,
    joinLoading,
    handleJoinProject,
    alreadyJoinedError,
    clearAlreadyJoinedError,
  } = useStudentProjects();

  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) {
      return [];
    }

    return projects.filter((p) => {
      const teacherName = p.teacherName || "";
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacherName.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === "enrolled") {
        return matchesSearch && myProjectIds.includes(p.id);
      } else if (filterStatus === "available") {
        return matchesSearch && !myProjectIds.includes(p.id);
      } else if (filterStatus === "notExpired") {
        const notExpired = new Date(p.expiredAt) >= new Date();
        return matchesSearch && notExpired;
      }

      return matchesSearch;
    });
  }, [projects, myProjectIds, searchTerm, filterStatus]);

  const isExpired = (expiredAt: string) => {
    return new Date(expiredAt) < new Date();
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground animate-pulse text-lg">
                  Đang tải dữ liệu...
                </p>
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
          <main className="flex-1 overflow-y-auto bg-slate-100/80">
            {/* Hero Banner - Reduced height with dark overlay */}
            <div className="relative h-48 sm:h-52 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url(/bkhoa2.jpg)",
                }}
              />
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-black/70" />

              {/* Banner content */}
              <div className="relative h-full flex flex-col justify-center px-6 sm:px-8 lg:px-12">
                <h1 className="text-[28px] sm:text-[36px] font-bold text-white mb-2 tracking-tight">
                  Tìm Đề tài
                </h1>
                <p className="text-white/85 text-[13px] sm:text-[15px] font-medium">
                  Duyệt và xem chi tiết các đề tài nghiên cứu
                </p>
              </div>
            </div>

            {/* Floating Search & Filter Card */}
            <div className="px-6 sm:px-8 lg:px-12 -mt-8 relative z-10">
              <Card className="shadow-lg shadow-gray-300/30 border border-gray-200/60 mb-8 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-5 sm:p-6 space-y-5">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm theo tên đề tài, mô tả, giáo viên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 text-[13px] sm:text-sm border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                    />
                  </div>

                  {/* Segmented Control Filters */}
                  <div className="flex flex-wrap gap-1 p-1 bg-gray-100/80 rounded-lg w-fit">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-4 py-2 rounded-[6px] text-[13px] font-medium transition-all ${
                        filterStatus === "all"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setFilterStatus("enrolled")}
                      className={`px-4 py-2 rounded-[6px] text-[13px] font-medium transition-all ${
                        filterStatus === "enrolled"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                      }`}
                    >
                      Đã tham gia ({myProjectIds?.length || 0})
                    </button>
                    <button
                      onClick={() => setFilterStatus("available")}
                      className={`px-4 py-2 rounded-[6px] text-[13px] font-medium transition-all ${
                        filterStatus === "available"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                      }`}
                    >
                      Có sẵn
                    </button>
                    <button
                      onClick={() => setFilterStatus("notExpired")}
                      className={`px-4 py-2 rounded-[6px] text-[13px] font-medium transition-all ${
                        filterStatus === "notExpired"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                      }`}
                    >
                      Còn hạn
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Grid */}
              <div className="pb-10">
                {filteredProjects.length === 0 ? (
                  <Card className="border-gray-200 bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-20 text-center">
                      <p className="text-gray-500 text-[15px] font-medium">
                        Không tìm thấy đề tài nào
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredProjects.map((project) => {
                      const isEnrolled =
                        myProjectIds?.includes(project.id) || false;
                      const expired = isExpired(project.expiredAt);

                      return (
                        <StudentProjectCard
                          key={project.id}
                          project={project}
                          isEnrolled={isEnrolled}
                          expired={expired}
                          onJoin={handleJoinProject}
                          joinLoading={joinLoading}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Dialog thông báo nổi giữa màn hình */}
        <Dialog
          open={!!alreadyJoinedError}
          onOpenChange={(open) => {
            if (!open) clearAlreadyJoinedError();
          }}
        >
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-gray-900">
                Không thể tham gia đề tài mới
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600 pt-2">
                Bạn đã tham gia dự án{" "}
                <span className="font-semibold text-gray-900">
                  "{alreadyJoinedError?.projectName}"
                </span>
                .<br />
                Vui lòng rời khỏi dự án hiện tại trước khi tham gia dự án mới.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-2 mt-2">
              <Button
                variant="outline"
                onClick={clearAlreadyJoinedError}
                className="px-6"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  clearAlreadyJoinedError();
                  window.location.href = "/student/my-project";
                }}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                Xem dự án của tôi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
