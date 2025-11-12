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

/**
 * Create a new user
 * @param userData Object chứa thông tin người dùng
 */
export const createUser = async (userData: any) => {
  try {
    // normalize payload: support callers that pass { firstName, lastName, avatar }
    const payload: any = {};

    if (userData.fullName) payload.fullName = userData.fullName;
    else if (userData.firstName || userData.lastName)
      payload.fullName = `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim();

    if (userData.email) payload.email = userData.email;
    if (userData.password) payload.password = userData.password;
    if (userData.role) payload.role = userData.role;
    if (userData.avatar) payload.avatar = userData.avatar; // avatar can be base64 string or url

    const response = await api.post(ADMIN.CREATE_USER, payload);
    return response.data;
  } catch (error) {
    console.error("Create user failed", error);
    throw error;
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (userId: number) => {
  try {
    const response = await api.delete(`${ADMIN.DELETE_USER}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete user failed", error);
    throw error;
  }
};

/**
 * Update user info
 */
export const updateUserInfo = async (
  userId: number,
  userData: {
    fullName?: string;
    email?: string;
    role?: string;
    avatar?: string; // ✅ thêm avatar
  }
) => {
  try {
    const response = await api.patch(`${ADMIN.UPDATE_USER}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Update user info failed", error);
    throw error;
  }
};

export const getAdminProjectsManagement = async () => {
  try {
    const response = await api.get(ADMIN.PROJECTS_MANAGEMENT);
    return response.data;
  } catch (error) {
    console.log("Get admin projects management failed", error);
    throw error;
  }
};
