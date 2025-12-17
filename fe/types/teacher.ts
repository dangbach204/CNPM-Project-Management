import { Project, Submission } from "./admin";

export interface StudentWithProjects {
  id: number;
  full_name: string;
  email: string;
  avatar: string;
  joinedProjects: { id: number; title: string }[];
}

export interface TeacherOverview {
  totalProjects: number;
  pendingSubmissionsCount: number;
  pendingSubmissions: Submission[];
  projects: Project[];
  allStudents: StudentWithProjects[];
}
