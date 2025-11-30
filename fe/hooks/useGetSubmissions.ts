import { getSubmissions } from "@/service/teacher-service";
import { useEffect, useState } from "react";

export const useGetSubmissions = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getSubmissions();
      if (response) {
        setSubmissions(response);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { submissions, isLoading, refetch: fetchData };
};
