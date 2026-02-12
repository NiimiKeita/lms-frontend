"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAdminUser, getUserProgress } from "@/lib/adminApi";
import type { AdminUser, UserCourseProgress } from "@/types/admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function UserProgressPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { user } = useAuth();

  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [progress, setProgress] = useState<UserCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [userData, progressData] = await Promise.all([
          getAdminUser(userId),
          getUserProgress(userId),
        ]);
        setTargetUser(userData);
        setProgress(progressData);
      } catch {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin/progress")}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          進捗管理
        </button>
        <span className="text-foreground/40">/</span>
        <span className="text-sm text-foreground">
          {targetUser?.name || "ユーザー"} の進捗
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {targetUser && (
        <Card className="!p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{targetUser.name}</h1>
              <p className="text-sm text-foreground/60">{targetUser.email}</p>
            </div>
            <Button variant="outline" onClick={() => router.push(`/admin/users/${userId}/edit`)}>
              ユーザー編集
            </Button>
          </div>
        </Card>
      )}

      {progress.length > 0 ? (
        <div className="space-y-3">
          {progress.map((cp) => (
            <Card key={cp.courseId} className="!p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{cp.courseTitle}</h3>
                <span className="text-sm text-foreground/60">
                  {cp.completedLessons}/{cp.totalLessons} レッスン完了
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-foreground/10 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(cp.progressPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-12 text-right">
                  {cp.progressPercentage}%
                </span>
              </div>
              <p className="text-xs text-foreground/40 mt-2">
                受講開始: {new Date(cp.enrolledAt).toLocaleDateString("ja-JP")}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-foreground/60 py-8">受講中のコースはありません</p>
        </Card>
      )}
    </div>
  );
}
