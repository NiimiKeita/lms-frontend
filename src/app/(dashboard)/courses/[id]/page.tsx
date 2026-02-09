"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourse, getLessons, deleteCourse, togglePublish } from "@/lib/courseApi";
import type { Course, Lesson } from "@/types/course";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LessonList from "@/components/lessons/LessonList";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourse(courseId),
        getLessons(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch {
      setError("コースの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleDelete = async () => {
    if (!confirm("このコースを削除してもよろしいですか？この操作は取り消せません。")) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteCourse(courseId);
      router.push("/courses");
    } catch {
      setError("コースの削除に失敗しました");
      setActionLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    setActionLoading(true);
    try {
      const updated = await togglePublish(courseId);
      setCourse(updated);
    } catch {
      setError("公開状態の変更に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLessonsChange = async () => {
    try {
      const lessonsData = await getLessons(courseId);
      setLessons(lessonsData);
    } catch {
      setError("レッスンの取得に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.push("/courses")}>
          コース一覧に戻る
        </Button>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/courses")}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          コース一覧
        </button>
        <span className="text-foreground/40">/</span>
        <span className="text-sm text-foreground">{course.title}</span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {course.title}
              </h1>
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                  course.published
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {course.published ? "公開中" : "非公開"}
              </span>
            </div>
            {isAdmin && (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="secondary"
                  onClick={() =>
                    router.push(`/admin/courses/${courseId}/edit`)
                  }
                >
                  編集
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTogglePublish}
                  loading={actionLoading}
                >
                  {course.published ? "非公開にする" : "公開する"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  loading={actionLoading}
                >
                  削除
                </Button>
              </div>
            )}
          </div>

          <p className="text-foreground/70 whitespace-pre-wrap">
            {course.description}
          </p>

          <div className="flex gap-4 text-xs text-foreground/40">
            <span>
              作成日: {new Date(course.createdAt).toLocaleDateString("ja-JP")}
            </span>
            <span>
              更新日: {new Date(course.updatedAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </Card>

      <LessonList
        courseId={courseId}
        lessons={lessons}
        isAdmin={isAdmin}
        onLessonsChange={handleLessonsChange}
      />
    </div>
  );
}
