"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/stores/user";
import { useAdminProjectsManagement } from "@/hooks/useAdminProjectsManagement";
import { countProjectsByStatus } from "@/lib/project-utils";
import { useMemo } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { ProjectCard } from "@/components/admin/ProjectCard";
import { ProjectsSearchFilter } from "@/components/admin/ProjectsSearchFilter";
import { useProjectsFilter } from "@/hooks/useProjectsFilter";
import { PROJECT_STATS_CONFIG } from "@/constants/project-stats";

export default function AdminProjectsPage() {
  const { user } = useAuthStore();
  const { isLoading, projectsManagement } = useAdminProjectsManagement();
  const projects = projectsManagement?.projects || [];

  if (!user || user.role !== "admin") redirect("/login");

  const stats = useMemo(
    () =>
      PROJECT_STATS_CONFIG.map((config: any) => ({
        ...config,
        value: config.statusKey
          ? countProjectsByStatus(projects, config.statusKey)
          : projects.length,
      })),
    [projects]
  );

  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredProjects,
  } = useProjectsFilter(projects);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground animate-pulse text-lg">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Quản lý Đề tài</h1>
                <p className="text-muted-foreground mt-2">
                  Quản lý tất cả đề tài trong hệ thống
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stats.map((stat) => (
                <StatsCard key={stat.label} {...stat} />
              ))}
            </div>

            {/* Search & Filter */}
            <ProjectsSearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />

            {/* Projects List */}
            <Card>
              <CardContent className="pt-6">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Không có đề tài nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((project: any) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={(p) => console.log("Edit", p)}
                        onDelete={(p) => console.log("Delete", p)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}