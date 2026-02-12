"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getTasks, getSubmissions } from "@/lib/taskApi";
import { getCourses } from "@/lib/courseApi";
import type { Task, TaskSubmission } from "@/types/task";
import type { Course, PageResponse } from "@/types/course";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "提出済み",
  REVIEWING: "レビュー中",
  APPROVED: "承認",
  REJECTED: "差し戻し",
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  REVIEWING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdminOrInstructor = user?.role === "ADMIN" || user?.role === "INSTRUCTOR";

  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<PageResponse<TaskSubmission> | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  if (!isAdminOrInstructor) {
    router.push("/dashboard");
    return null;
  }

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getCourses(0, 100);
      setCourses(data.content);
      if (data.content.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data.content[0].id);
      }
    } catch {
      setError("コース一覧の取得に失敗しました");
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!selectedCourseId) return;
    try {
      const data = await getTasks(selectedCourseId);
      setTasks(data);
      if (data.length > 0 && !selectedTaskId) {
        setSelectedTaskId(data[0].id);
      } else if (data.length === 0) {
        setSelectedTaskId(null);
        setSubmissions(null);
      }
    } catch {
      setError("課題一覧の取得に失敗しました");
    }
  }, [selectedCourseId]);

  const fetchSubmissions = useCallback(async () => {
    if (!selectedTaskId) return;
    setLoading(true);
    try {
      const data = await getSubmissions(selectedTaskId, page);
      setSubmissions(data);
    } catch {
      setError("提出一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [selectedTaskId, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    setSelectedTaskId(null);
    setTasks([]);
    setSubmissions(null);
    fetchTasks();
  }, [selectedCourseId, fetchTasks]);

  useEffect(() => {
    if (selectedTaskId) {
      fetchSubmissions();
    }
  }, [selectedTaskId, fetchSubmissions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">提出管理</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <Card className="!p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground/60 mb-1">コース</label>
            <select
              value={selectedCourseId ?? ""}
              onChange={(e) => {
                setSelectedCourseId(Number(e.target.value));
                setPage(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground/60 mb-1">課題</label>
            <select
              value={selectedTaskId ?? ""}
              onChange={(e) => {
                setSelectedTaskId(Number(e.target.value));
                setPage(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {tasks.length === 0 && (
                <option value="">課題がありません</option>
              )}
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : submissions && submissions.content.length > 0 ? (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-foreground/5">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">ID</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">受講者</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">GitHub URL</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">ステータス</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">提出日</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/60">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {submissions.content.map((s) => (
                <tr key={s.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 text-foreground/60">{s.id}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{s.userName}</td>
                  <td className="px-4 py-3">
                    <a
                      href={s.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate block max-w-xs"
                    >
                      {s.githubUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[s.status] || ""
                      }`}
                    >
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {new Date(s.submittedAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/submissions/${s.id}`)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      レビュー
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {submissions.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/10">
              <span className="text-xs text-foreground/60">
                全 {submissions.totalElements} 件中 {page * 20 + 1}-
                {Math.min((page + 1) * 20, submissions.totalElements)} 件
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={submissions.first}
                >
                  前へ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={submissions.last}
                >
                  次へ
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-center text-foreground/60 py-8">提出がありません</p>
        </Card>
      )}
    </div>
  );
}
