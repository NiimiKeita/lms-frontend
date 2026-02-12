import api from "./api";
import type { AuditLog } from "@/types/auditLog";
import type { PageResponse } from "@/types/course";

export async function getAuditLogs(
  page: number = 0,
  size: number = 20,
  action?: string,
  entityType?: string,
  userId?: number
): Promise<PageResponse<AuditLog>> {
  const params: Record<string, string | number> = { page, size };
  if (action) params.action = action;
  if (entityType) params.entityType = entityType;
  if (userId) params.userId = userId;
  const response = await api.get<PageResponse<AuditLog>>("/admin/audit-logs", {
    params,
  });
  return response.data;
}

export async function downloadAuditLogsCsv(): Promise<void> {
  const response = await api.get("/admin/audit-logs/export", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = "audit-logs.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
