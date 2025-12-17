"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Calendar,
  Clock,
  UserCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useStudentProjects } from "@/hooks/useStudentProjects";

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
}

function StudentProjectCard({
  project,
  isEnrolled,
  expired,
}: StudentProjectCardProps) {
  return (
    <Card className="group shadow-md shadow-gray-200/80 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300 border border-gray-300/80 bg-white">
      <CardContent className="p-5">
        {/* Header: Title + Status Badge */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-[17px] sm:text-lg font-semibold text-gray-900 leading-[1.4] flex-1 tracking-[-0.01em]">
            {project.title}
          </h3>
          <div className="shrink-0">
            {isEnrolled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50/80 text-blue-600 border border-blue-200/50 tracking-wide">
                Đã tham gia
              </span>
            )}
            {expired && !isEnrolled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200/50 tracking-wide">
                Đã hết hạn
              </span>
            )}
            {!expired && !isEnrolled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50/80 text-emerald-600 border border-emerald-200/50 tracking-wide">
                Đang mở
              </span>
            )}
          </div>
        </div>

        {/* Description - 2 lines max */}
        <p className="text-[13px] sm:text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Key Info Grid - Prioritized order */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-4 pb-4 border-b border-gray-100">
          {/* 1. Expired Date - High Priority */}
          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Hết hạn
            </p>
            <p
              className={`text-[13px] sm:text-sm font-semibold leading-tight ${
                expired ? "text-gray-500" : "text-amber-600"
              }`}
            >
              {project.expiredAt
                ? new Date(project.expiredAt).toLocaleDateString("vi-VN")
                : "Không giới hạn"}
            </p>
          </div>

          {/* 2. Supervisor */}
          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
              <UserCircle className="w-3.5 h-3.5 text-gray-400" />
              Giáo viên
            </p>
            <p className="text-[13px] sm:text-sm font-medium text-gray-900 truncate leading-tight">
              {project.teacherName || "Chưa có"}
            </p>
          </div>

          {/* 3. Student Slots */}
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              Số SV
            </p>
            <p className="text-[13px] sm:text-sm font-semibold text-gray-900 leading-tight">
              {project.studentCount}
            </p>
          </div>

          {/* 4. Created Date - Secondary */}
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Tạo lúc
            </p>
            <p className="text-[13px] sm:text-sm text-gray-600 leading-tight">
              {new Date(project.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* CTA Button - View Details Only */}
        <Link href={`/student/projects/${project.id}`} className="block">
          <Button
            variant="outline"
            className="w-full h-10 border-gray-300 bg-white text-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all text-[13px] font-medium"
          >
            Xem chi tiết
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function StudentProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { isLoading, projects, myProjectIds, joinLoading, handleJoinProject } =
    useStudentProjects();

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
          <main className="flex-1 overflow-y-auto bg-gray-50/50">
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
              <Card className="shadow-xl shadow-gray-200/40 border-0 mb-8 bg-white">
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
                  </div>
                </CardContent>
              </Card>

              {/* Projects Grid */}
              <div className="pb-10">
                {filteredProjects.length === 0 ? (
                  <Card className="border-gray-200/60">
                    <CardContent className="py-20 text-center">
                      <p className="text-gray-500 text-[15px] font-medium">
                        Không tìm thấy đề tài nào
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-5">
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
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
