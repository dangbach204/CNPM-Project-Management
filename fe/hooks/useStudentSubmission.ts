import { useState, useEffect } from "react";
import {
  getStudentSubmissions,
  submitProject,
} from "@/service/student-service";
import { useToast } from "@/hooks/use-toast";
import { MySubmission } from "@/types/student";

export const useStudentSubmission = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await getStudentSubmissions();
      if (response) {
        setSubmissions(response);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài nộp",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProject = async (projectId: number, reportLink: string) => {
    try {
      setSubmitLoading(true);
      const response = await submitProject(projectId, reportLink);
      if (response) {
        toast({
          title: "Thành công",
          description: "Nộp bài thành công",
        });
        await fetchSubmissions(); // Refresh submissions list
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error submitting project:", error);
      toast({
        title: "Lỗi",
        description:
          error?.response?.data?.message ||
          "Không thể nộp bài, vui lòng thử lại",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    isLoading,
    submitLoading,
    handleSubmitProject,
    refetch: fetchSubmissions,
  };
};
