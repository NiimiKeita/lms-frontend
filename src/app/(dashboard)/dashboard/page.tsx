"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyProgress } from "@/lib/progressApi";
import { getMyEnrollments } from "@/lib/enrollmentApi";
import { getCourses } from "@/lib/courseApi";
import type { CourseProgress, Enrollment } from "@/types/enrollment";
import type { Course, PageResponse } from "@/types/course";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressList, setProgressList] = useState<CourseProgress[]>([]);
  const [coursesData, setCoursesData] = useState<PageResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: Promise<unknown>[] = [
          getMyEnrollments(),
          getMyProgress(),
        ];
        if (isAdmin) {
          promises.push(getCourses(0, 1));
        }
        const results = await Promise.all(promises);
        setEnrollments(results[0] as Enrollment[]);
        setProgressList(results[1] as CourseProgress[]);
        if (isAdmin && results[2]) {
          setCoursesData(results[2] as PageResponse<Course>);
        }
      } catch {
        // エラーは静かに処理
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
  const completedEnrollments = enrollments.filter((e) => e.status === "COMPLETED");
  const totalCompletedLessons = progressList.reduce(
    (sum, p) => sum + p.completedLessons,
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">ダッシュボード</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-4">
          ようこそ、{user?.username} さん
        </h2>
        <p className="text-foreground/60">
          SkillBridge LMS へようこそ。ここからコースの学習を始めましょう。
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold text-foreground/80">受講中のコース</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? "-" : activeEnrollments.length}
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-foreground/80">完了したレッスン</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? "-" : totalCompletedLessons}
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-foreground/80">完了コース</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? "-" : completedEnrollments.length}
          </p>
        </Card>
      </div>

      {/* 受講中コース一覧 */}
      {!loading && progressList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              受講中のコース
            </h2>
            <Button
              variant="outline"
              onClick={() => router.push("/my-courses")}
            >
              すべて見る
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressList.slice(0, 4).map((progress) => (
              <Card key={progress.courseId} className="!p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm">
                      {progress.courseTitle}
                    </h3>
                    <span className="text-xs text-foreground/60 shrink-0">
                      {progress.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-foreground/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        progress.progressPercentage >= 100
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{
                        width: `${Math.min(progress.progressPercentage, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/40">
                      {progress.completedLessons}/{progress.totalLessons}{" "}
                      レッスン
                    </span>
                    <Button
                      variant="secondary"
                      className="!px-3 !py-1 !text-xs"
                      onClick={() =>
                        router.push(`/courses/${progress.courseId}/learn`)
                      }
                    >
                      学習を続ける
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && progressList.length === 0 && !isAdmin && (
        <Card>
          <div className="text-center py-6">
            <p className="text-foreground/60 mb-4">
              まだコースを受講していません。
            </p>
            <Button onClick={() => router.push("/courses")}>
              コースを探す
            </Button>
          </div>
        </Card>
      )}

      {/* ADMIN 統計 */}
      {!loading && isAdmin && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">管理者統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="font-semibold text-foreground/80">登録コース数</h3>
              <p className="text-3xl font-bold mt-2">
                {coursesData ? coursesData.totalElements : "-"}
              </p>
            </Card>
            <Card>
              <h3 className="font-semibold text-foreground/80">クイックリンク</h3>
              <div className="mt-3 space-y-2">
                <Button
                  variant="secondary"
                  className="w-full !text-sm"
                  onClick={() => router.push("/admin/courses/new")}
                >
                  新規コース作成
                </Button>
                <Button
                  variant="outline"
                  className="w-full !text-sm"
                  onClick={() => router.push("/courses")}
                >
                  コース一覧を見る
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
