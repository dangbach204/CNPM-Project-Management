import { getLogs } from "@/service/admin-service";
import { Log } from "@/types/admin";
import { useEffect, useState } from "react";

export const useAdminLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getLogs();
      if (response) {
        // Handle both array and object with logs property
        const logsData = Array.isArray(response)
          ? response
          : response.logs || [];
        setLogs(logsData);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = async () => {
    await fetchData();
  };

  return { isLoading, logs, refetch };
};
