"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAdminProgress, getAdminStats } from "@/lib/adminApi";
import type { UserProgressSummary, AdminStats } from "@/types/admin";
import type { PageResponse } from "@/types/course";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminProgressPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<PageResponse<UserProgressSummary> | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  if (user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [progressData, statsData] = await Promise.all([
        getAdminProgress(page, 20),
        getAdminStats(),
      ]);
      setData(progressData);
      setStats(statsData);
    } catch {
      setError("進捗データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">進捗管理</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="!p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
            <p className="text-xs text-foreground/60 mt-1">総ユーザー数</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalCourses}</p>
            <p className="text-xs text-foreground/60 mt-1">総コース数</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalEnrollments}</p>
            <p className="text-xs text-foreground/60 mt-1">総受講登録数</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.averageCompletionRate}%</p>
            <p className="text-xs text-foreground/60 mt-1">平均完了率</p>
          </Card>
        </div>
      )}

      {/* ユーザー進捗テーブル */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : data && data.content.length > 0 ? (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-foreground/5">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">ユーザー</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">メール</th>
                <th className="text-center px-4 py-3 font-medium text-foreground/60">受講コース</th>
                <th className="text-center px-4 py-3 font-medium text-foreground/60">完了コース</th>
                <th className="text-center px-4 py-3 font-medium text-foreground/60">平均進捗</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {data.content.map((u) => (
                <tr key={u.userId} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 text-foreground font-medium">{u.userName}</td>
                  <td className="px-4 py-3 text-foreground/80">{u.email}</td>
                  <td className="px-4 py-3 text-center text-foreground">{u.enrolledCourses}</td>
                  <td className="px-4 py-3 text-center text-foreground">{u.completedCourses}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-foreground/10 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(u.averageProgress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground/60">{u.averageProgress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/users/${u.userId}/progress`)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/10">
              <span className="text-xs text-foreground/60">
                全 {data.totalElements} 件
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={data.first}
                >
                  前へ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last}
                >
                  次へ
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-center text-foreground/60 py-8">進捗データがありません</p>
        </Card>
      )}
    </div>
  );
}
