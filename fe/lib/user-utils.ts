export type UserRole = "admin" | "teacher" | "student";

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700",
  teacher: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  student: "Sinh viên",
};

export const getRoleColor = (role: UserRole): string => ROLE_COLORS[role];
export const getRoleLabel = (role: UserRole): string => ROLE_LABELS[role];
