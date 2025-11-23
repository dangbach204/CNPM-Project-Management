import api from "@/config/axios";
import { USER } from "@/constants/api-endpoint";

export const updateProfile = async (
  userId: number,
  userData:
    | FormData
    | {
        fullName?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
      }
) => {
  try {
    const isFormData = userData instanceof FormData;
    const response = await api.patch(USER.UPDATE_PROFILE, userData, {
      headers: isFormData ? { "Content-Type": undefined } : undefined,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
