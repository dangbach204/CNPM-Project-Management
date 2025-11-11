import {
  ProjectStatus,
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
} from "@/types/status";

export const getProjectStatusColor = (status: ProjectStatus): string => {
  return PROJECT_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
};

export const getProjectStatusLabel = (status: ProjectStatus): string => {
  return PROJECT_STATUS_LABELS[status] || status;
};

export const countProjectsByStatus = (
  projects: Array<{ status: ProjectStatus }>,
  status: ProjectStatus
): number => {
  return projects.filter((p) => p.status === status).length;
};
