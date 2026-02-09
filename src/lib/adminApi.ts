import api from "@/lib/api";
import type { PageResponse } from "@/types/course";
import type {
  AdminUser,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  UserProgressSummary,
  UserCourseProgress,
  AdminStats,
} from "@/types/admin";

// ===== User Management API =====

export async function getAdminUsers(
  page: number = 0,
  size: number = 20,
  keyword?: string,
  role?: string
): Promise<PageResponse<AdminUser>> {
  const params: Record<string, string | number> = { page, size };
  if (keyword) params.keyword = keyword;
  if (role) params.role = role;
  const response = await api.get<PageResponse<AdminUser>>("/admin/users", { params });
  return response.data;
}

export async function getAdminUser(id: number): Promise<AdminUser> {
  const response = await api.get<AdminUser>(`/admin/users/${id}`);
  return response.data;
}

export async function createAdminUser(data: AdminCreateUserRequest): Promise<AdminUser> {
  const response = await api.post<AdminUser>("/admin/users", data);
  return response.data;
}

export async function updateAdminUser(
  id: number,
  data: AdminUpdateUserRequest
): Promise<AdminUser> {
  const response = await api.put<AdminUser>(`/admin/users/${id}`, data);
  return response.data;
}

export async function toggleUserEnabled(id: number): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${id}/toggle-enabled`);
  return response.data;
}

// ===== Admin Progress API =====

export async function getAdminProgress(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<UserProgressSummary>> {
  const params = { page, size };
  const response = await api.get<PageResponse<UserProgressSummary>>("/admin/progress", { params });
  return response.data;
}

export async function getUserProgress(userId: number): Promise<UserCourseProgress[]> {
  const response = await api.get<UserCourseProgress[]>(`/admin/users/${userId}/progress`);
  return response.data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<AdminStats>("/admin/stats");
  return response.data;
}
