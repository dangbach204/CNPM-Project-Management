export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
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