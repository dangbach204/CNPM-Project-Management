"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminProjectsManagement } from "@/hooks/useAdminProjectsManagement";
import { countProjectsByStatus } from "@/lib/project-utils";
import { useMemo } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { ProjectCard } from "@/components/admin/ProjectCard";
import { ProjectsSearchFilter } from "@/components/admin/ProjectsSearchFilter";
import { useProjectsFilter } from "@/hooks/useProjectsFilter";
import { PROJECT_STATS_CONFIG } from "@/constants/project-stats";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import { useProjectOperations } from "@/hooks/useProjectOperations";
import { EditProjectDialog } from "@/components/admin/EditProjectDialog";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";

export default function AdminProjectsPage() {
  const { isLoading, projectsManagement, refetch } =
    useAdminProjectsManagement() as any;
  const { adminUserManagement } = useAdminUserManagement();

  const projects = projectsManagement?.projects || [];
  const teachers = adminUserManagement?.teachers || [];
  const students = adminUserManagement?.students || [];

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

  const projectOperations = useProjectOperations({
    onSuccess: refetch,
  });

  const handleStatsCardClick = (statusKey: string | null) => {
    if (statusKey === null) {
      setFilterStatus("all");
    } else {
      setFilterStatus(statusKey);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground animate-pulse text-lg">
            Đang tải dữ liệu...
          </p>
        </div>
      </ProtectedRoute>
    );
  }

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

              {/* Gradient overlay (fade to white) */}
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Quản lý Đề tài
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Quản lý và theo dõi tất cả đề tài trong hệ thống
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {stats.map((stat) => {
                  const isActive =
                    stat.statusKey === null
                      ? filterStatus === "all"
                      : filterStatus === stat.statusKey;

                  return (
                    <StatsCard
                      key={stat.label}
                      {...stat}
                      onClick={() => handleStatsCardClick(stat.statusKey)}
                      isActive={isActive}
                    />
                  );
                })}
              </div>

              {/* Search & Filter */}
              <ProjectsSearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
              />

              {/* Delete confirmation dialog */}
              <DeleteUserDialog
                open={projectOperations.deleteDialogOpen}
                onClose={() => projectOperations.setDeleteDialogOpen(false)}
                onConfirm={projectOperations.handleConfirmDelete}
                userName={projectOperations.selectedProject?.title}
                loading={projectOperations.deleteLoading}
              />

              {/* Edit Project Dialog */}
              <EditProjectDialog
                open={projectOperations.editDialogOpen}
                onClose={() => projectOperations.setEditDialogOpen(false)}
                onSave={projectOperations.handleConfirmUpdate}
                project={projectOperations.editProject}
                loading={projectOperations.editLoading}
                teachers={teachers}
                allStudents={students}
                allProjects={projects}
              />

              {/* Projects List */}
              <Card className="shadow-sm border-0">
                <CardContent className="pt-6">
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground text-sm">
                        {searchTerm || filterStatus !== "all"
                          ? "Không tìm thấy đề tài nào phù hợp với bộ lọc"
                          : "Chưa có đề tài nào trong hệ thống"}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                          Hiển thị{" "}
                          <span className="font-semibold text-foreground">
                            {filteredProjects.length}
                          </span>{" "}
                          đề tài
                        </p>
                      </div>
                      <div className="space-y-3">
                        {filteredProjects.map((project: any) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={projectOperations.handleUpdateRequest}
                            onDelete={projectOperations.handleDeleteRequest}
                            teachers={teachers}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
