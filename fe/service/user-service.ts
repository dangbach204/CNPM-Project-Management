import api from "@/config/axios";
import { USER } from "@/constants/api-endpoint";

export const updateProfile = async (
  userId: number,
  userData: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
) => {
  try {
    const response = await api.patch(
      `${USER.UPDATE_PROFILE}/${userId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Update profile failed", error);
    throw error;
  }
};
