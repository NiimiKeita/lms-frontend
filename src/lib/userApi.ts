import api from "@/lib/api";

export interface Profile {
  id: number;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  username: string;
}

export async function getProfile(): Promise<Profile> {
  const response = await api.get<Profile>("/users/me/profile");
  return response.data;
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<Profile> {
  const response = await api.put<Profile>("/users/me/profile", data);
  return response.data;
}
