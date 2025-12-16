import { createProject } from "@/service/teacher-service";
import { useState } from "react";


export const useTeacherCreateProject = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);

    const handleCreateProject = async (projectData: {
        title: string;
        description: string;
        createAt?: string;
        expireAt?: string;
    }) => {
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await createProject(projectData);
            setSuccess(true);
            return response;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to create project";
            setError(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    return { isLoading, error, success, handleCreateProject };
}