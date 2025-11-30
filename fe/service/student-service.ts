import api from "@/config/axios";
import { STUDENT } from "@/constants/api-endpoint";

export const getStudentOverview = async () => {
  try {
    const response = await api.get(STUDENT.OVERVIEW);
    return response.data;
  } catch (error) {
    console.error("Error fetching student overview:", error);
    throw error;
  }
};

export const getAllProjects = async () => {
  try {
    const response = await api.get(STUDENT.GET_ALL_PROJECTS);
    return response.data;
  } catch (error) {
    console.error("Error fetching all projects:", error);
    throw error;
  }
};

export const joinProject = async (projectId: number) => {
  try {
    const response = await api.post(STUDENT.JOIN_PROJECT, { projectId });
    return response.data;
  } catch (error) {
    console.error("Error joining project:", error);
    throw error;
  }
};

export const leaveProject = async (projectId: number) => {
  try {
    const response = await api.post(STUDENT.LEAVE_PROJECT, { projectId });
    return response.data;
  } catch (error) {
    console.error("Error leaving project:", error);
    throw error;
  }
};
