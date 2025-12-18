import { getAdminUserManagement } from "@/service/admin-service";
import { AdminUserManagement, UserManagementParams } from "@/types/admin";
import { useCallback, useEffect, useState } from "react";

export const useAdminUserManagement = (
  initialParams?: UserManagementParams
) => {
  const [adminUserManagement, setAdminUserManagement] =
    useState<AdminUserManagement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [params, setParams] = useState<UserManagementParams>({
    page: 1,
    limit: 15,
    role: "all",
    search: "",
    ...initialParams,
  });

  const fetchData = useCallback(
    async (fetchParams?: UserManagementParams) => {
      try {
        setIsLoading(true);
        const queryParams = fetchParams || params;
        const response = await getAdminUserManagement(queryParams);
        if (response) {
          setAdminUserManagement(response);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchData(params);
  }, [params.page, params.limit, params.role, params.search]);

  const refetch = async () => {
    await fetchData(params);
  };

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const setRole = (role: string) => {
    setParams((prev) => ({ ...prev, role, page: 1 }));
  };

  const setSearch = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  return {
    isLoading,
    adminUserManagement,
    refetch,
    params,
    setPage,
    setLimit,
    setRole,
    setSearch,
  };
};
