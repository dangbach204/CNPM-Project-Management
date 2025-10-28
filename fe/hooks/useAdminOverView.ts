import { getAdminOverview } from "@/service/admin-service";
import { AdminOverView } from "@/types/admin";
import { useEffect, useState } from "react";

export const useAdminOverView = () => {
  const [overview, setOverview] = useState<AdminOverView | null>(null);
  const [isLoading, setisLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setisLoading(true);
        const response = await getAdminOverview();
        if (response) {
          setOverview(response);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setisLoading(false);
      }
    };
    fetchData();
  }, []);
  return { isLoading, overview };
};
