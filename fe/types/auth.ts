export interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role?: string;
  createdAt: string;
  avatar?: string;
}
