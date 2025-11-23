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
