import { createUser } from "@/service/admin-service";
import { useState } from "react";

export const useAdminCreateUser = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleCreateUser = async (userData: {
    fullName: string;
    email: string;
    password: string;
    role: string;
  }) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await createUser(userData);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to create user";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, success, handleCreateUser };
};
