"use client";

import { useState } from "react";
import type { Lesson } from "@/types/course";
import type { LessonFormData } from "@/lib/validations";
import {
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/courseApi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LessonForm from "@/components/lessons/LessonForm";

interface LessonListProps {
  courseId: number;
  lessons: Lesson[];
  isAdmin: boolean;
  onLessonsChange: () => void;
}

export default function LessonList({
  courseId,
  lessons,
  isAdmin,
  onLessonsChange,
}: LessonListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreateLesson = async (data: LessonFormData) => {
    setError("");
    try {
      await createLesson(courseId, {
        title: data.title,
        contentPath: data.contentPath,
        sortOrder: lessons.length + 1,
        published: data.published,
      });
      setShowAddForm(false);
      onLessonsChange();
    } catch {
      setError("レッスンの作成に失敗しました");
    }
  };

  const handleUpdateLesson = async (data: LessonFormData) => {
    if (!editingLesson) return;
    setError("");
    try {
      await updateLesson(courseId, editingLesson.id, {
        title: data.title,
        contentPath: data.contentPath,
        published: data.published,
      });
      setEditingLesson(null);
      onLessonsChange();
    } catch {
      setError("レッスンの更新に失敗しました");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("このレッスンを削除してもよろしいですか？")) return;
    setError("");
    setDeletingId(lessonId);
    try {
      await deleteLesson(courseId, lessonId);
      onLessonsChange();
    } catch {
      setError("レッスンの削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedLessons = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">レッスン</h2>
        {isAdmin && !showAddForm && (
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddForm(true);
              setEditingLesson(null);
            }}
          >
            レッスン追加
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card>
          <h3 className="font-semibold mb-4">新しいレッスン</h3>
          <LessonForm
            onSubmit={handleCreateLesson}
            onCancel={() => setShowAddForm(false)}
            submitLabel="追加"
          />
        </Card>
      )}

      {sortedLessons.length > 0 ? (
        <div className="space-y-2">
          {sortedLessons.map((lesson) => (
            <Card key={lesson.id} className="!p-4">
              {editingLesson?.id === lesson.id ? (
                <div>
                  <h3 className="font-semibold mb-4">レッスン編集</h3>
                  <LessonForm
                    defaultValues={{
                      title: lesson.title,
                      contentPath: lesson.contentPath,
                      published: lesson.published,
                    }}
                    onSubmit={handleUpdateLesson}
                    onCancel={() => setEditingLesson(null)}
                    submitLabel="更新"
                  />
                </div>
              ) : (
                <div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedLesson(
                        expandedLesson === lesson.id ? null : lesson.id
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground/40 font-mono w-6 text-center">
                        {lesson.sortOrder}
                      </span>
                      <span className="font-medium text-foreground">
                        {lesson.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          lesson.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lesson.published ? "公開" : "非公開"}
                      </span>
                    </div>
                    <span className="text-foreground/40 text-sm">
                      {expandedLesson === lesson.id ? "閉じる" : "詳細"}
                    </span>
                  </div>

                  {expandedLesson === lesson.id && (
                    <div className="mt-3 pt-3 border-t border-foreground/10 space-y-2">
                      <p className="text-sm text-foreground/60">
                        <span className="font-medium">コンテンツパス:</span>{" "}
                        {lesson.contentPath}
                      </p>
                      <p className="text-sm text-foreground/60">
                        <span className="font-medium">作成日:</span>{" "}
                        {new Date(lesson.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                      {isAdmin && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLesson(lesson);
                              setShowAddForm(false);
                            }}
                          >
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            loading={deletingId === lesson.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson.id);
                            }}
                          >
                            削除
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-foreground/60 py-4">
          レッスンはまだありません
        </p>
      )}
    </div>
  );
}
