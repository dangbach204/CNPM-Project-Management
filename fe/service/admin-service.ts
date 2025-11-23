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

export const createUser = async (userData: any) => {
  try {
    if (userData instanceof FormData) {
      const response = await api.post(ADMIN.CREATE_USER, userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }

    const payload: any = {};

    if (userData.fullName) payload.fullName = userData.fullName;
    else if (userData.firstName || userData.lastName)
      payload.fullName = `${userData.firstName ?? ""} ${
        userData.lastName ?? ""
      }`.trim();

    if (userData.email) payload.email = userData.email;
    if (userData.password) payload.password = userData.password;
    if (userData.role) payload.role = userData.role;
    if (userData.avatar) payload.avatar = userData.avatar;

    const response = await api.post(ADMIN.CREATE_USER, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: number) => {
  try {
    const response = await api.delete(`${ADMIN.DELETE_USER}/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserInfo = async (
  userId: number,
  userData:
    | {
        fullName?: string;
        email?: string;
        role?: string;
        avatar?: string | File;
      }
    | FormData
) => {
  try {
    const isFormData = userData instanceof FormData;
    const response = await api.patch(
      `${ADMIN.UPDATE_USER}/${userId}`,
      userData,
      {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdminProjectsManagement = async () => {
  try {
    const response = await api.get(ADMIN.PROJECTS_MANAGEMENT);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (projectId: number) => {
  try {
    const response = await api.delete(`${ADMIN.DELETE_PROJECT}/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProjectInfo = async (
  projectId: number,
  projectData: {
    title?: string;
    description?: string;
    teacherId?: string | number;
    status?: string;
    expiredAt?: string | Date;
    addStudents?: number[];
    removeStudents?: number[];
  }
) => {
  try {
    const response = await api.patch(
      `${ADMIN.UPDATE_PROJECT}/${projectId}`,
      projectData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLogs = async () => {
  try {
    const response = await api.get(ADMIN.LOGS);
    return response.data;
  } catch (error) {
    throw error;
  }
};
