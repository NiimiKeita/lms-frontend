"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyEnrollments } from "@/lib/enrollmentApi";
import { getMyProgress } from "@/lib/progressApi";
import type { Enrollment, CourseProgress } from "@/types/enrollment";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type TabType = "active" | "completed" | "all";

export default function MyCoursesPage() {
  const router = useRouter();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressList, setProgressList] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentsData, progressData] = await Promise.all([
          getMyEnrollments(),
          getMyProgress(),
        ]);
        setEnrollments(enrollmentsData);
        setProgressList(progressData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProgress = (courseId: number): CourseProgress | undefined => {
    return progressList.find((p) => p.courseId === courseId);
  };

  const filteredEnrollments = enrollments.filter((e) => {
    if (activeTab === "active" && e.status !== "ACTIVE") return false;
    if (activeTab === "completed" && e.status !== "COMPLETED") return false;
    if (searchKeyword) {
      return e.courseTitle.toLowerCase().includes(searchKeyword.toLowerCase());
    }
    return true;
  });

  const tabs: { key: TabType; label: string; count: number }[] = [
    {
      key: "active",
      label: "受講中",
      count: enrollments.filter((e) => e.status === "ACTIVE").length,
    },
    {
      key: "completed",
      label: "完了",
      count: enrollments.filter((e) => e.status === "COMPLETED").length,
    },
    { key: "all", label: "すべて", count: enrollments.length },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">マイコース</h1>

      {/* キーワード検索 */}
      <div className="flex gap-3">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="コース名で絞り込み..."
          className="flex-1 px-3 py-2.5 rounded-lg border border-foreground/20 text-sm bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {searchKeyword && (
          <Button variant="outline" onClick={() => setSearchKeyword("")}>
            クリア
          </Button>
        )}
      </div>

      {/* タブ */}
      <div className="flex gap-1 border-b border-foreground/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-foreground/50 hover:text-foreground/80"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* コース一覧 */}
      {filteredEnrollments.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-foreground/60 mb-4">
              {activeTab === "active"
                ? "受講中のコースはありません。"
                : activeTab === "completed"
                ? "完了したコースはありません。"
                : "受講しているコースはありません。"}
            </p>
            <Button onClick={() => router.push("/courses")}>
              コースを探す
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnrollments.map((enrollment) => {
            const progress = getProgress(enrollment.courseId);

            return (
              <Card
                key={enrollment.id}
                className="!p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div
                  className="space-y-3"
                  onClick={() =>
                    enrollment.status === "ACTIVE"
                      ? router.push(`/courses/${enrollment.courseId}/learn`)
                      : router.push(`/courses/${enrollment.courseId}`)
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                      {enrollment.courseTitle}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full shrink-0 ${
                        enrollment.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {enrollment.status === "COMPLETED" ? "完了" : "受講中"}
                    </span>
                  </div>

                  {progress && (
                    <>
                      <div className="w-full bg-foreground/10 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            progress.progressPercentage >= 100
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              progress.progressPercentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-foreground/40">
                        <span>
                          {progress.completedLessons}/{progress.totalLessons}{" "}
                          レッスン
                        </span>
                        <span>{progress.progressPercentage}%</span>
                      </div>
                    </>
                  )}

                  <div className="text-xs text-foreground/40">
                    受講開始:{" "}
                    {new Date(enrollment.enrolledAt).toLocaleDateString("ja-JP")}
                    {enrollment.completedAt && (
                      <>
                        {" "}
                        / 完了:{" "}
                        {new Date(enrollment.completedAt).toLocaleDateString(
                          "ja-JP"
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
