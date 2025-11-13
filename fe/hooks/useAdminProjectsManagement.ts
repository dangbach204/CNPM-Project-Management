import { getAdminProjectsManagement } from "@/service/admin-service";
import { AdminProjectsManagement } from "@/types/admin";
import { useEffect, useState } from "react";

export const useAdminProjectsManagement = () => {
  const [projectsManagement, setProjectsManagement] =
    useState<AdminProjectsManagement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminProjectsManagement();
      if (response) {
        setProjectsManagement(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { isLoading, projectsManagement, refetch: fetchData };
};