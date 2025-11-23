import { getTeacherOverview } from "@/service/teacher-service";
import { TeacherOverview } from "@/types/teacher";
import { useEffect, useState } from "react";

export const useTeacherOverview = () => {
    const [overview, setOverview ] = useState<TeacherOverview | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await getTeacherOverview();
                if (response) {
                    setOverview(response);
                }
            } catch (error) {
                console.error("Failed to fetch teacher overview", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    return { isLoading, overview };
}