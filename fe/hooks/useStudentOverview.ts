import { getStudentOverview } from "@/service/student-service";
import { StudentOverview } from "@/types/student";
import { useEffect, useState } from "react";

const useStudentOverview = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [overview, setOverview] = useState<StudentOverview | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getStudentOverview();
        if (response) {
          setOverview(response);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching student overview:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  return { isLoading, overview };
};

export default useStudentOverview;
