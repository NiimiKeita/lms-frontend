"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourse, getLessons, getLesson } from "@/lib/courseApi";
import { getCourseProgress } from "@/lib/progressApi";
import { completeLesson, uncompleteLesson } from "@/lib/progressApi";
import type { Course, Lesson } from "@/types/course";
import type { CourseProgress, LessonProgress } from "@/types/enrollment";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function LearnPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [courseData, lessonsData, progressData] = await Promise.all([
        getCourse(courseId),
        getLessons(courseId),
        getCourseProgress(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
      setProgress(progressData);

      // 最初のレッスンを選択
      if (lessonsData.length > 0 && !selectedLesson) {
        setSelectedLesson(lessonsData[0]);
      }
    } catch {
      setError("コースの読み込みに失敗しました。受講登録を確認してください。");
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedLesson]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectLesson = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleToggleComplete = async (lessonId: number, isCompleted: boolean) => {
    setActionLoading(true);
    setError("");
    try {
      if (isCompleted) {
        await uncompleteLesson(courseId, lessonId);
      } else {
        await completeLesson(courseId, lessonId);
      }
      // 進捗を再取得
      const progressData = await getCourseProgress(courseId);
      setProgress(progressData);
    } catch {
      setError("進捗の更新に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: number): boolean => {
    if (!progress?.lessonProgresses) return false;
    const lp = progress.lessonProgresses.find((p) => p.lessonId === lessonId);
    return lp?.completed ?? false;
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
        <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
          コース詳細に戻る
        </Button>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-4">
      {/* パンくずリスト */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => router.push("/courses")}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          コース一覧
        </button>
        <span className="text-foreground/40">/</span>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          {course.title}
        </button>
        <span className="text-foreground/40">/</span>
        <span className="text-foreground">学習</span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 進捗バー */}
      {progress && (
        <Card className="!p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground">{course.title}</h2>
            <span className="text-sm text-foreground/60">
              {progress.completedLessons}/{progress.totalLessons} レッスン完了
              ({progress.progressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-foreground/10 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progressPercentage}%` }}
            />
          </div>
        </Card>
      )}

      {/* メインコンテンツ */}
      <div className="flex gap-4">
        {/* レッスンサイドバー */}
        <div className="w-72 shrink-0">
          <Card className="!p-3">
            <h3 className="font-semibold text-sm text-foreground/80 mb-3 px-2">
              レッスン一覧
            </h3>
            <div className="space-y-1">
              {lessons.map((lesson, index) => {
                const completed = isLessonCompleted(lesson.id);
                const isSelected = selectedLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      isSelected
                        ? "bg-foreground/10 text-foreground font-medium"
                        : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-xs ${
                        completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-foreground/30"
                      }`}
                    >
                      {completed ? "v" : index + 1}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* レッスンコンテンツ */}
        <div className="flex-1">
          {selectedLesson ? (
            <Card>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedLesson.title}
                  </h2>
                  <Button
                    variant={isLessonCompleted(selectedLesson.id) ? "secondary" : "primary"}
                    onClick={() =>
                      handleToggleComplete(
                        selectedLesson.id,
                        isLessonCompleted(selectedLesson.id)
                      )
                    }
                    loading={actionLoading}
                    className="shrink-0"
                  >
                    {isLessonCompleted(selectedLesson.id)
                      ? "完了を取消"
                      : "完了にする"}
                  </Button>
                </div>

                <div className="border-t border-foreground/10 pt-4">
                  <div className="prose prose-sm max-w-none text-foreground/80">
                    <p className="text-foreground/60 text-sm">
                      コンテンツパス: {selectedLesson.contentPath}
                    </p>
                    <div className="mt-4 p-6 bg-foreground/5 rounded-lg text-center text-foreground/40">
                      レッスンコンテンツはここに表示されます。
                      <br />
                      (コンテンツ表示機能は今後のSprintで実装予定)
                    </div>
                  </div>
                </div>

                {/* ナビゲーション */}
                <div className="flex justify-between pt-4 border-t border-foreground/10">
                  {lessons.findIndex((l) => l.id === selectedLesson.id) > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentIndex = lessons.findIndex(
                          (l) => l.id === selectedLesson.id
                        );
                        setSelectedLesson(lessons[currentIndex - 1]);
                      }}
                    >
                      前のレッスン
                    </Button>
                  ) : (
                    <div />
                  )}
                  {lessons.findIndex((l) => l.id === selectedLesson.id) <
                  lessons.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const currentIndex = lessons.findIndex(
                          (l) => l.id === selectedLesson.id
                        );
                        setSelectedLesson(lessons[currentIndex + 1]);
                      }}
                    >
                      次のレッスン
                    </Button>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-foreground/60 text-center py-8">
                左のレッスン一覧からレッスンを選択してください
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
