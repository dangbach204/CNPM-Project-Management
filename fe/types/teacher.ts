import { Project, Submission } from "./admin";

export interface StudentWithProjects {
  id: number;
  full_name: string;
  email: string;
  avatar: string;
  joinedProjects: { id: number; title: string }[];
}

export interface TeacherOverview {
  projects: Project[];
  totalProjects: number;
  submissions: Submission[];
  totalSubmissions: number;
  allStudents: StudentWithProjects[];
}
