"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTeacherOverview } from "@/hooks/useTeacherOverview";
import { TeacherProjectCard } from "@/components/teacher/TeacherProjectCard";
import { EditProjectDialog } from "@/components/teacher/EditProjectDialog";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import { useTeacherProjectOperations } from "@/hooks/useTeacherProjectOperations";

export default function TeacherProjectsPage() {
  const { user } = useAuthStore();
  const { isLoading, overview } = useTeacherOverview();

  const myProjects = overview?.projects || [];

  const projectOperations = useTeacherProjectOperations({
    onSuccess: () => {
      window.location.reload();
    },
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground animate-pulse text-lg">
            Đang tải dữ liệu...
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          {/* MAIN CONTENT */}
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

            {/* CONTENT */}
            <div className="relative z-10 min-h-full p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
              {/* Page header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Danh sách đề tài
                  </h1>
                  <p className="text-[13px] text-gray-600 mt-1">
                    Quản lý các đề tài của bạn
                  </p>
                </div>

                <Link href="/teacher/projects/new">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10">
                    <Plus className="w-4 h-4" />
                    Tạo đề tài mới
                  </Button>
                </Link>
              </div>

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
                allProjects={myProjects}
                allStudents={overview?.allStudents || []}
              />

              {/* Project list */}
              {myProjects.length === 0 ? (
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600 mb-4">
                      Bạn chưa tạo đề tài nào
                    </p>
                    <Link href="/teacher/projects/new">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Tạo đề tài đầu tiên
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myProjects.map((project: any) => (
                    <TeacherProjectCard
                      key={project.id}
                      project={project}
                      onEdit={projectOperations.handleUpdateRequest}
                      onDelete={projectOperations.handleDeleteRequest}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
