import { getSubmissions } from "@/service/teacher-service";
import { use, useEffect, useState } from "react";

export const useGetSubmissions = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getSubmissions();
        if (response) {
          setSubmissions(response);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Failed to fetch submissions:", error);
      }
    };

    fetchData();
  }, []);

  return { submissions, isLoading };
}