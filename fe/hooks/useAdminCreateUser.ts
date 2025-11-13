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
      const fullName = `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim();

      let avatarData: string | undefined;

      if (userData.avatar instanceof File) {
        const fileReader = new FileReader();
        avatarData = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result as string);
          fileReader.onerror = reject;
          fileReader.readAsDataURL(userData.avatar as File);
        });
      } else if (typeof userData.avatar === "string") {
        avatarData = userData.avatar;
      }

      const payload = {
        fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        avatar: avatarData,
      };

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
