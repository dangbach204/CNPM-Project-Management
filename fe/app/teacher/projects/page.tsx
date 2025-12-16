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
  const allStudents = overview?.allStudents || [];

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
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Danh sách đề tài</h1>
                </div>
                <Link href="/teacher/projects/new">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo Đề tài Mới
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
                allStudents={allStudents}
                allProjects={myProjects}
              />

              {myProjects.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      Bạn chưa tạo đề tài nào
                    </p>
                    <Link href="/teacher/projects/new">
                      <Button>Tạo Đề tài Đầu tiên</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {myProjects.map((project: any) => (
                        <TeacherProjectCard
                          key={project.id}
                          project={project}
                          onEdit={projectOperations.handleUpdateRequest}
                          onDelete={projectOperations.handleDeleteRequest}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
