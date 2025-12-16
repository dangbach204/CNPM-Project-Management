import { useState, useEffect } from "react";
import { getMyProject } from "@/service/student-service";
import { useToast } from "@/hooks/use-toast";
import { MyProject } from "@/types/student";

export const useMyProject = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [myProject, setMyProject] = useState<MyProject | null>(null);
  const { toast } = useToast();

  const fetchMyProject = async () => {
    try {
      setIsLoading(true);
      const response = await getMyProject();
      if (response && response.project) {
        setMyProject(response.project);
      }
    } catch (error: any) {
      console.error("Error fetching my project:", error);
      if (error?.response?.status !== 404) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin đề tài của bạn",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProject();
  }, []);

  return {
    isLoading,
    myProject,
    refreshMyProject: fetchMyProject,
  };
};
