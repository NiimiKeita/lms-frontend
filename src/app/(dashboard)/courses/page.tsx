"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourses } from "@/lib/courseApi";
import type { Course, PageResponse } from "@/types/course";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [courses, setCourses] = useState<PageResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCourses(page, 10, keyword || undefined);
      setCourses(data);
    } catch {
      setError("コースの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">コース一覧</h1>
        {isAdmin && (
          <Button onClick={() => router.push("/admin/courses/new")}>
            新規作成
          </Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="キーワードで検索..."
          className="flex-1 px-3 py-2.5 rounded-lg border border-foreground/20 text-sm bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        <Button type="submit" variant="secondary">
          検索
        </Button>
        {keyword && (
          <Button type="button" variant="outline" onClick={handleClearSearch}>
            クリア
          </Button>
        )}
      </form>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : courses && courses.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.content.map((course) => (
              <Card
                key={course.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => router.push(`/courses/${course.id}`)}
                  className="space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {course.title}
                    </h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-xs rounded-full ${
                        course.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.published ? "公開" : "非公開"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/60 line-clamp-3">
                    {course.description}
                  </p>
                  <p className="text-xs text-foreground/40">
                    作成日: {new Date(course.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* ページネーション */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-foreground/60">
              全 {courses.totalElements} 件中{" "}
              {courses.page * courses.size + 1} -{" "}
              {Math.min(
                (courses.page + 1) * courses.size,
                courses.totalElements
              )}{" "}
              件を表示
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p - 1)}
                disabled={courses.first}
              >
                前へ
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={courses.last}
              >
                次へ
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <p className="text-center text-foreground/60 py-8">
            {keyword
              ? "検索条件に一致するコースがありません"
              : "コースがまだありません"}
          </p>
        </Card>
      )}
    </div>
  );
}
