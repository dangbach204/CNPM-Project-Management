import { getLogs } from "@/service/admin-service";
import { Log } from "@/types/admin";
import { useEffect, useState } from "react";

export const useAdminLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLogs, setTotalLogs] = useState<number>(0);

  const fetchData = async (page: number = 1, limit: number = 10) => {
    try {
      setIsLoading(true);
      const response = await getLogs(page, limit);
      if (response) {
        const logsData = Array.isArray(response.logs) ? response.logs : [];
        setLogs(logsData);
        if (response.pagination) {
          setCurrentPage(response.pagination.currentPage);
          setTotalPages(response.pagination.totalPages);
          setTotalLogs(response.pagination.totalLogs);
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, 10);
  }, []);

  const goToPage = async (page: number, limit: number = 10) => {
    await fetchData(page, limit);
  };

  const refetch = async () => {
    await fetchData(currentPage, 10);
  };

  return {
    isLoading,
    logs,
    refetch,
    currentPage,
    totalPages,
    totalLogs,
    goToPage,
  };
};
