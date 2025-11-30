import { useState, useEffect } from "react";
import {
  getAllProjects,
  joinProject,
  leaveProject,
} from "@/service/student-service";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  status: string;
  createdAt: string;
  expiredAt: string;
  teacher: {
    id: number;
    fullName: string;
    email: string;
    avatar: string | null;
  };
  studentCount: number;
  students: {
    id: number;
    fullName: string;
    email: string;
    avatar: string | null;
  }[];
}

export interface ProjectsData {
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
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await getAllProjects();
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
      await joinProject(projectId);
      toast({
        title: "Thành công",
        description: "Đã tham gia đề tài",
      });
      await fetchProjects(); // Refresh data
    } catch (error: any) {
      console.error("Error joining project:", error);
      toast({
        title: "Lỗi",
        description:
          error?.response?.data?.message || "Không thể tham gia đề tài",
        variant: "destructive",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveProject = async (projectId: number) => {
    try {
      setJoinLoading(true);
      await leaveProject(projectId);
      toast({
        title: "Thành công",
        description: "Đã rời khỏi đề tài",
      });
      await fetchProjects(); // Refresh data
    } catch (error: any) {
      console.error("Error leaving project:", error);
      toast({
        title: "Lỗi",
        description:
          error?.response?.data?.message || "Không thể rời khỏi đề tài",
        variant: "destructive",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  return {
    isLoading,
    projects: projectsData.projects,
    myProjectIds: projectsData.myProjectIds,
    joinLoading,
    handleJoinProject,
    handleLeaveProject,
    refreshProjects: fetchProjects,
  };
};
