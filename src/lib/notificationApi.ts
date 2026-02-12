import api from "./api";
import type { Notification } from "@/types/notification";

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>("/notifications");
  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<{ count: number }>("/notifications/unread-count");
  return response.data.count;
}

export async function markAsRead(id: number): Promise<Notification> {
  const response = await api.patch<Notification>(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllAsRead(): Promise<void> {
  await api.post("/notifications/read-all");
}
