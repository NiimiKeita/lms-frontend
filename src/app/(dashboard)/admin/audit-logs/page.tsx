"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuditLogs, downloadAuditLogsCsv } from "@/lib/auditLogApi";
import type { AuditLog } from "@/types/auditLog";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const ACTIONS = ["", "CREATE", "UPDATE", "DELETE"];
const ENTITY_TYPES = ["", "USER", "COURSE", "CATEGORY"];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);

  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(
        page,
        20,
        actionFilter || undefined,
        entityTypeFilter || undefined
      );
      setLogs(data.content);
      setTotalPages(data.totalPages);
    } catch {
      setError("監査ログの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityTypeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleCsvDownload = async () => {
    try {
      setCsvLoading(true);
      await downloadAuditLogsCsv();
    } catch {
      setError("CSVエクスポートに失敗しました");
    } finally {
      setCsvLoading(false);
    }
  };

  const actionLabel = (action: string) => {
    switch (action) {
      case "CREATE": return "作成";
      case "UPDATE": return "更新";
      case "DELETE": return "削除";
      default: return action;
    }
  };

  const actionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-green-100 text-green-700";
      case "UPDATE": return "bg-blue-100 text-blue-700";
      case "DELETE": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">監査ログ</h1>
        <Button onClick={handleCsvDownload} loading={csvLoading} variant="outline">
          CSVエクスポート
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-foreground/20 rounded-lg text-sm bg-background text-foreground"
        >
          <option value="">全アクション</option>
          {ACTIONS.filter(Boolean).map((a) => (
            <option key={a} value={a}>{actionLabel(a)}</option>
          ))}
        </select>
        <select
          value={entityTypeFilter}
          onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-foreground/20 rounded-lg text-sm bg-background text-foreground"
        >
          <option value="">全エンティティ</option>
          {ENTITY_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center py-8 text-foreground/50 text-sm">ログがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left py-2 px-3 text-foreground/60 font-medium">日時</th>
                  <th className="text-left py-2 px-3 text-foreground/60 font-medium">ユーザー</th>
                  <th className="text-left py-2 px-3 text-foreground/60 font-medium">アクション</th>
                  <th className="text-left py-2 px-3 text-foreground/60 font-medium">対象</th>
                  <th className="text-left py-2 px-3 text-foreground/60 font-medium">詳細</th>
                  <th className="text-left py-2 px-3 text-foreground/60 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-foreground/5">
                    <td className="py-2 px-3 text-foreground/70 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 px-3 text-foreground">
                      {log.userName || (log.userId ? `ID:${log.userId}` : "-")}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${actionColor(log.action)}`}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-foreground/70">
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId}` : ""}
                    </td>
                    <td className="py-2 px-3 text-foreground/50 text-xs max-w-xs truncate">
                      {log.details || "-"}
                    </td>
                    <td className="py-2 px-3 text-foreground/50 text-xs">
                      {log.ipAddress || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            前へ
          </Button>
          <span className="text-sm text-foreground/60">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
