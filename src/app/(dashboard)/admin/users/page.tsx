"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAdminUsers, toggleUserEnabled } from "@/lib/adminApi";
import type { AdminUser } from "@/types/admin";
import type { PageResponse } from "@/types/course";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理者",
  INSTRUCTOR: "講師",
  LEARNER: "受講者",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  INSTRUCTOR: "bg-blue-100 text-blue-700",
  LEARNER: "bg-green-100 text-green-700",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<PageResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [confirmToggle, setConfirmToggle] = useState<AdminUser | null>(null);

  if (user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminUsers(page, 20, keyword || undefined, roleFilter || undefined);
      setData(result);
    } catch {
      setError("ユーザー一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [page, keyword, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleEnabled = async (target: AdminUser) => {
    setConfirmToggle(null);
    try {
      await toggleUserEnabled(target.id);
      fetchUsers();
    } catch {
      setError("ユーザーの有効/無効切替に失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">ユーザー管理</h1>
        <Button onClick={() => router.push("/admin/users/new")}>新規追加</Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 検索・フィルタ */}
      <Card className="!p-4">
        <form onSubmit={handleSearch} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground/60 mb-1">キーワード</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="名前またはメールで検索"
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1">ロール</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              <option value="">すべて</option>
              <option value="ADMIN">管理者</option>
              <option value="INSTRUCTOR">講師</option>
              <option value="LEARNER">受講者</option>
            </select>
          </div>
          <Button type="submit">検索</Button>
        </form>
      </Card>

      {/* テーブル */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : data && data.content.length > 0 ? (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-foreground/5">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">ID</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">名前</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">メール</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">ロール</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">状態</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {data.content.map((u) => (
                <tr key={u.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 text-foreground/60">{u.id}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-foreground/80">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ""}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {u.enabled ? "有効" : "無効"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => setConfirmToggle(u)}
                        className={`text-xs hover:underline ${u.enabled ? "text-orange-600" : "text-green-600"}`}
                      >
                        {u.enabled ? "無効化" : "有効化"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ページネーション */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/10">
              <span className="text-xs text-foreground/60">
                全 {data.totalElements} 件中 {page * 20 + 1}-{Math.min((page + 1) * 20, data.totalElements)} 件
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
          <p className="text-center text-foreground/60 py-8">ユーザーが見つかりません</p>
        </Card>
      )}

      {/* 確認ダイアログ */}
      {confirmToggle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">確認</h3>
            <p className="text-sm text-foreground/80 mb-4">
              {confirmToggle.name} ({confirmToggle.email}) を
              {confirmToggle.enabled ? "無効" : "有効"}にしますか？
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmToggle(null)}>
                キャンセル
              </Button>
              <Button
                variant={confirmToggle.enabled ? "secondary" : "primary"}
                onClick={() => handleToggleEnabled(confirmToggle)}
              >
                {confirmToggle.enabled ? "無効にする" : "有効にする"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
