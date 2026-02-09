export type UserRole = "LEARNER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  enabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
  errors?: Record<string, string>;
}
