import { getLogs } from "@/service/admin-service";
import { Log } from "@/types/admin";
import { useEffect, useState } from "react";

export const useLogs = () => {
  const [logs, setLogs] = useState<Log | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getLogs();
        if (response) {
          setLogs(response);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  return { isLoading, logs };
};
