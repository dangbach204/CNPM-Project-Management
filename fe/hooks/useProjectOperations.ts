import { Project } from "@/types/admin";
import { useCallback, useState } from "react";
import { toast } from "./use-toast";
import { deleteProject, updateProjectInfo } from "@/service/admin-service";

interface UseProjectOperationProps {
  onSuccess?: () => void;
}

export function useProjectOperations({ onSuccess }: UseProjectOperationProps) {
  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleDeleteRequest = useCallback((projectToDelete: Project) => {
    setSelectedProject(projectToDelete);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProject) return;

    setDeleteLoading(true);
    try {
      await deleteProject(selectedProject.id);
      toast({ title: "Xóa thành công" });
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Xóa thất bại",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedProject, toast, onSuccess]);

  const handleUpdateRequest = useCallback((projectToEdit: Project) => {
    setEditProject(projectToEdit);
    setEditDialogOpen(true);
  }, []);

  const handleConfirmUpdate = useCallback(
    async (
      projectId: number,
      data: {
        title: string;
        description: string;
        teacherId: string | number;
        status: string;
        expiredAt: string | Date;
        addStudents: number[];
        removeStudents: number[];
      }
    ) => {
      setEditLoading(true);
      try {
        let expiredAtValue: string | undefined;
        if (data.expiredAt) {
          if (typeof data.expiredAt === "string") {
            if (data.expiredAt.includes("T")) {
              expiredAtValue = data.expiredAt;
            } else {
              const date = new Date(data.expiredAt + "T23:59:59");
              expiredAtValue = date.toISOString();
            }
          } else if (data.expiredAt instanceof Date) {
            expiredAtValue = data.expiredAt.toISOString();
          }
        }

        const updateData = {
          title: data.title,
          description: data.description,
          teacherId: data.teacherId,
          status: data.status,
          expiredAt: expiredAtValue,
          addStudents: data.addStudents,
          removeStudents: data.removeStudents,
        };

        await updateProjectInfo(projectId, updateData);
        toast({ title: "Cập nhật thành công" });
        setEditDialogOpen(false);
        setEditProject(null);
        onSuccess?.();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
        toast({
          title: "Cập nhật thất bại",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setEditLoading(false);
      }
    },
    [toast, onSuccess]
  );

  return {
    // Delete
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedProject,
    deleteLoading,
    handleDeleteRequest,
    handleConfirmDelete,

    // Edit
    editDialogOpen,
    setEditDialogOpen,
    editProject,
    editLoading,
    handleUpdateRequest,
    handleConfirmUpdate,
  };
}
