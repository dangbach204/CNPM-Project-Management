import { Project, Submission } from "./admin";
import { User } from "./auth";

export interface TeacherOverview {
  projects: Project[];
  totalProjects: number;
  submissions: Submission[];
  totalSubmissions: number;
}
