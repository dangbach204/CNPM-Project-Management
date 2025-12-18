import { useState, useEffect } from "react";
import { getProjects, joinProject } from "@/service/student-service";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/student";
import { parseApiError, getUserFriendlyMessage } from "@/lib/error-utils";

interface ProjectsData {
  projects: Project[];
  myProjectIds: number[];
}

export const useStudentProjects = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [projectsData, setProjectsData] = useState<ProjectsData>({
    projects: [],
    myProjectIds: [],
  });
  const [joinLoading, setJoinLoading] = useState(false);
  const [alreadyJoinedError, setAlreadyJoinedError] = useState<{
    projectName: string;
  } | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await getProjects();
      if (response) {
        setProjectsData(response);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đề tài",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleJoinProject = async (projectId: number) => {
    try {
      setJoinLoading(true);
      setAlreadyJoinedError(null);
      await joinProject(projectId);
      toast({
        title: "Thành công",
        description: "Đã tham gia đề tài",
      });
      await fetchProjects();
    } catch (error: any) {
      const errorDetails = parseApiError(error);

      if (errorDetails.status === 400 && errorDetails.details?.joinedProject) {
        const joinedProject = errorDetails.details.joinedProject;
        setAlreadyJoinedError({
          projectName: joinedProject.title || "dự án hiện tại",
        });
      } else {
        toast({
          title: errorDetails.type === "network" ? "Lỗi kết nối" : "Lỗi",
          description: getUserFriendlyMessage(errorDetails),
          variant: "destructive",
        });
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const clearAlreadyJoinedError = () => {
    setAlreadyJoinedError(null);
  };

  return {
    isLoading,
    projects: projectsData.projects,
    myProjectIds: projectsData.myProjectIds,
    joinLoading,
    handleJoinProject,
    refreshProjects: fetchProjects,
    alreadyJoinedError,
    clearAlreadyJoinedError,
  };
};
