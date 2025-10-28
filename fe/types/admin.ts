import { User } from "./auth";

export interface Submission {
  id: number;
  projectTitle: string;
  studentId: number;
  reportLink: string;
  submittedAt: string;
}
export interface Project {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  studentId: number;
  status: string;
  createdAt: string;
  studentCount?: number;
  teacherInstructor?: string;
}
export interface AdminOverView {
  teachers: User[];
  students: User[];
  totalProjects: number;
  totalSubmissions: number;
  latestProjects: Project[];
  latestSubmissions: Submission[];
  projects: Project[];
  submissions: Submission[];
}

export interface AdminUserManagement {
  users: User[];
  totalUsers: number;
  admins: User[];
  teachers: User[];
  students: User[];
}

export interface AdminCreateUser {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "teacher" | "student";
}
