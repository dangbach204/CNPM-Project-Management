import api from "@/config/axios";
import { TEACHER } from "@/constants/api-endpoint";
import { TeacherOverview } from "@/types/teacher";

export const getTeacherOverview = async () => {
  try {
    const response = await api.get<TeacherOverview>(TEACHER.OVERVIEW);
    return response.data;
  } catch (error) {
    console.error("Get teacher overview failed", error);
    throw error;
  }
};

export const createProject = async (data: {
  title: string;
  description: string;
  createAt?: string;
  expireAt?: string;
}) => {
  try {
    const response = await api.post(TEACHER.CREATE_PROJECT, data);
    return response.data;
  } catch (error) {
    console.error("Create project failed", error);
    throw error;
  }
};

export const updateProjectInfo = async (
  projectId: number,
  projectData: {
    title?: string;
    description?: string;
    status?: string;
    expireAt?: string;
    addStudents?: number[];
    removeStudents?: number[];
  }
) => {
  try {
    const response = await api.patch(
      `${TEACHER.UPDATE_PROJECT}/${projectId}`,
      projectData
    );
    return response.data;
  } catch (error) {
    console.error("Update project info failed", error);
    throw error;
  }
};

export const deleteProject = async (projectId: number) => {
  try {
    const response = await api.delete(`${TEACHER.DELETE_PROJECT}/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Delete project failed", error);
    throw error;
  }
};

export const getSubmissions = async () => {
  try {
    const response = await api.get(TEACHER.SUBMISSIONS);
    return response.data;
  } catch (error) {
    console.error("Get submissions failed", error);
    throw error;
  }
};

export const teacherGradeSubmission = async (
  submissionId: number,
  gradeData: {
    score: number;
    feedback?: string;
  }
) => {
  try {
    const response = await api.patch(
      `${TEACHER.GRADE_SUBMISSION}/${submissionId}`,
      gradeData
    );
    return response.data;
  } catch (error) {
    console.error("Grade submission failed", error);
    throw error;
  }
};