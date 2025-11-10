import api from "@/config/axios";
import { ADMIN } from "@/constants/api-endpoint";
import { AdminOverView, AdminUserManagement } from "@/types/admin";

export const getAdminOverview = async () => {
  try {
    const response = await api.get<AdminOverView>(ADMIN.OVERVIEW);
    return response.data;
  } catch (error) {
    console.error("Get admin overview failed", error);
    return null;
  }
};

export const getAdminUserManagement = async () => {
  try {
    const response = await api.get<AdminUserManagement>(ADMIN.USER_MANAGEMENT);
    return response.data;
  } catch (error) {
    console.error("Get admin user management failed", error);
    return null;
  }
};

export const createUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  role: string;
}) => {
  try {
    const response = await api.post(ADMIN.CREATE_USER, userData);
    return response.data;
  } catch (error) {
    console.error("Create user failed", error);
    throw error;
  }
};

export const deleteUser = async (userId: number) => {
  try {
    const response = await api.delete(`${ADMIN.DELETE_USER}/${userId}`);

    return response.data;
  } catch (error) {
    console.error("Delete user failed", error);
    throw error;
  }
};

export const updateUserInfo = async (
  userId: number,
  userData: {
    fullName?: string;
    email?: string;
    role?: string;
  }
) => {
  try {
    const response = await api.patch(
      `${ADMIN.UPDATE_USER}/${userId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Update user info failed", error);
    throw error;
  }
};
