"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useStudentProjects } from "@/hooks/useStudentProjects";

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
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              <div>
                <h1 className="text-3xl font-bold">Tìm Đề tài</h1>
                <p className="text-muted-foreground mt-2">
                  Duyệt và tham gia các đề tài
                </p>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm đề tài..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    onClick={() => setFilterStatus("all")}
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={
                      filterStatus === "enrolled" ? "default" : "outline"
                    }
                    onClick={() => setFilterStatus("enrolled")}
                  >
                    Đã tham gia ({myProjectIds?.length || 0})
                  </Button>
                  <Button
                    variant={
                      filterStatus === "available" ? "default" : "outline"
                    }
                    onClick={() => setFilterStatus("available")}
                  >
                    Có sẵn
                  </Button>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">
                      Không tìm thấy đề tài nào
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredProjects.map((project) => {
                    const isEnrolled =
                      myProjectIds?.includes(project.id) || false;
                    const expired = isExpired(project.expiredAt);

                    return (
                      <Card
                        key={project.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">
                                  {project.title}
                                </h3>
                                {expired && (
                                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
                                    Đã hết hạn
                                  </span>
                                )}
                                {isEnrolled && (
                                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                    Đã tham gia
                                  </span>
                                )}
                              </div>

                              <p className="text-muted-foreground mb-4">
                                {project.description}
                              </p>

                              <div className="grid grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Giáo viên
                                  </p>
                                  <p className="font-medium">
                                    {project.teacherName || "Chưa có"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Sinh viên
                                  </p>
                                  <p className="font-medium">
                                    {project.studentCount}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Tạo lúc
                                  </p>
                                  <p className="font-medium">
                                    {new Date(
                                      project.createdAt
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Hết hạn
                                  </p>
                                  <p className="font-medium">
                                    {project.expiredAt
                                      ? new Date(
                                          project.expiredAt
                                        ).toLocaleDateString("vi-VN")
                                      : "Không giới hạn"}
                                  </p>
                                </div>
                              </div>
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
