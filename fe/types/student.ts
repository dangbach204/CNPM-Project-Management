export interface StudentOverview {
  myProject: {
    projectId: number;
    title: string;
    description: string;
    joinedAt: string;
  }[];
  mySubmissions: {
    submissionId: number;
    projectId: number;
    title: string;
    description: string;
    submittedAt: string;
    reportLink: string;
    grade: {
      score: number;
      feedback: string;
    } | null;
  }[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  teacherName: string | null;
  studentCount: string;
  students: {
    id: number;
    fullName: string;
    email: string;
  };
  createdAt: string;
  expiredAt: string;
}

export interface MyProject {
  projectId: number;
  title: string;
  description: string;
  teacher: {
    id: number;
    name: string;
  } | null;
  joinedAt: string;
  expireAt: string;
}

export interface Submission {
  id: number;
  projectId: number;
  studentId: number;
  reportLink: string;
  submittedAt: string;
}

export interface MySubmission {
  id: number;
  projectId: number;
  projectTitle: string | null;
  projectDescription: string | null;
  reportLink: string;
  submittedAt: string;
  grade: string | null;
}
