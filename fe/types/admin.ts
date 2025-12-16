import { User } from "./auth";
import { ProjectStatus, SubmissionStatus } from "./status";

export interface Submission {
  id: number;
  projectTitle: string;
  studentId: number;
  reportLink: string;
  submittedAt: string;
  status?: SubmissionStatus;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  studentId: number;
  status: ProjectStatus;
  createdAt: string;
  expiredAt: string;
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
  avatar?: string | File;
}

export interface AdminProjectsManagement {
  projects: Project[];
  totalProjects: number;
}

export interface Log {
  id: number;
  action: string;
  createdAt: string;
  entityType: string;
  entityId: number;
  details: JSON;
  ipAddress: string;
}

export interface LogsResponse {
  logs: Log[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalLogs: number;
    logsPerPage: number;
  };
}
