import { getAdminUserManagement } from "@/service/admin-service";
import { AdminUserManagement } from "@/types/admin";
import { useEffect, useState } from "react";

export const useAdminUserManagement = () => {
    const [adminUserManagement, setAdminUserManagement] = useState<AdminUserManagement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await getAdminUserManagement();
                if(response) {
                    setAdminUserManagement(response);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    return {isLoading, adminUserManagement}
}