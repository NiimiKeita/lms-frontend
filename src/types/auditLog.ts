export interface AuditLog {
  id: number;
  userId: number | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}
