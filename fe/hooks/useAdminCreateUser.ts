import { createUser } from "@/service/admin-service";
import { useState } from "react";

export const useAdminCreateUser = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleCreateUser = async (userData: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    role: string;
    avatar?: string | File | null;
  }) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const fullName = `${userData.firstName ?? ""} ${
        userData.lastName ?? ""
      }`.trim();

      let payload: any;

      if (userData.avatar instanceof File) {
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("role", userData.role);
        formData.append("avatar", userData.avatar);
        payload = formData;
      } else {
        payload = {
          fullName,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          avatar: userData.avatar,
        };
      }

      const response = await createUser(payload);
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
