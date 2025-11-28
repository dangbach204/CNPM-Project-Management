export const AUTH = {
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_RESET_TOKEN: "/auth/verify-reset-token",
  RESET_PASSWORD: "/auth/reset-password",
};

export const ADMIN = {
  OVERVIEW: "/admin/overview",
  USER_MANAGEMENT: "/admin/users-management",
  CREATE_USER: "/admin/create-user",
  DELETE_USER: "/admin/delete-user",
  UPDATE_USER: "/admin/update-user-info",

  PROJECTS_MANAGEMENT: "/admin/projects-management",
  DELETE_PROJECT: "/admin/delete-project",
  UPDATE_PROJECT: "/admin/update-project",

  LOGS: "/admin/logs-overview",
};

export const USER = {
  UPDATE_PROFILE: "/user/profile",
};

export const TEACHER = {
  OVERVIEW: "/teacher/overview",
  CREATE_PROJECT: "/teacher/create-project",
  UPDATE_PROJECT: "/teacher/update-project",
  DELETE_PROJECT: "/teacher/delete-project",

  SUBMISSIONS: "/teacher/submissions",
};
