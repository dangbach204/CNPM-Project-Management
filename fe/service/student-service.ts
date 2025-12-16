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
    const response = await api.get(STUDENT.PROJECTS);
    return response.data;
  } catch (error) {
    console.error("Error fetching all projects:", error);
    throw error;
  }
};

export const getMyProject = async () => {
  try {
    const response = await api.get(STUDENT.MY_PROJECT);
    return response.data;
  } catch (error) {
    console.error("Error fetching my project:", error);
    throw error;
  }
};

export const joinProject = async (projectId: number) => {
  try {
    const response = await api.patch(`${STUDENT.JOIN_PROJECT}/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error joining project:", error);
    throw error;
  }
};

export const submitProject = async (projectId: number, reportLink: string) => {
  try {
    const response = await api.post(`${STUDENT.SUBMIT_PROJECT}/${projectId}`, {
      reportLink,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting project:", error);
    throw error;
  }
};

export const getStudentSubmissions = async () => {
  try {
    const response = await api.get(STUDENT.MY_SUBMISSIONS);
    return response.data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
};
