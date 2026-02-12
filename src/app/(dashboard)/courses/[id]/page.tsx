"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourse, getLessons, deleteCourse, togglePublish } from "@/lib/courseApi";
import { enroll, unenroll, getEnrollment } from "@/lib/enrollmentApi";
import { getTasks } from "@/lib/taskApi";
import { getReviews, getMyReview, createReview, updateReview, deleteReview } from "@/lib/reviewApi";
import type { Course, Lesson } from "@/types/course";
import type { Enrollment } from "@/types/enrollment";
import type { Task } from "@/types/task";
import type { Review } from "@/types/review";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import LessonList from "@/components/lessons/LessonList";
import TaskList from "@/components/tasks/TaskList";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isAdminOrInstructor = user?.role === "ADMIN" || user?.role === "INSTRUCTOR";

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [courseData, lessonsData, tasksData] = await Promise.all([
        getCourse(courseId),
        getLessons(courseId),
        getTasks(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
      setTasks(tasksData);

      // 受講状態を確認
      try {
        const enrollmentData = await getEnrollment(courseId);
        setEnrollment(enrollmentData);
      } catch {
        setEnrollment(null);
      }

      // レビュー取得
      try {
        const reviewsData = await getReviews(courseId);
        setReviews(reviewsData.content);
      } catch {
        // ignore
      }

      try {
        const myReviewData = await getMyReview(courseId);
        setMyReview(myReviewData);
        setReviewRating(myReviewData.rating);
        setReviewComment(myReviewData.comment || "");
      } catch {
        setMyReview(null);
      }
    } catch {
      setError("コースの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEnroll = async () => {
    setEnrollLoading(true);
    setError("");
    try {
      const enrollmentData = await enroll(courseId);
      setEnrollment(enrollmentData);
    } catch {
      setError("受講登録に失敗しました");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm("受講登録を取り消しますか？進捗データも失われます。")) {
      return;
    }
    setEnrollLoading(true);
    setError("");
    try {
      await unenroll(courseId);
      setEnrollment(null);
    } catch {
      setError("受講取り消しに失敗しました");
    } finally {
      setEnrollLoading(false);
    }
  };

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

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      if (myReview) {
        const updated = await updateReview(courseId, { rating: reviewRating, comment: reviewComment || undefined });
        setMyReview(updated);
      } else {
        const created = await createReview(courseId, { rating: reviewRating, comment: reviewComment || undefined });
        setMyReview(created);
      }
      const reviewsData = await getReviews(courseId);
      setReviews(reviewsData.content);
      const courseData = await getCourse(courseId);
      setCourse(courseData);
    } catch {
      setError("レビューの投稿に失敗しました");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!confirm("レビューを削除しますか？")) return;
    try {
      await deleteReview(courseId);
      setMyReview(null);
      setReviewRating(0);
      setReviewComment("");
      const reviewsData = await getReviews(courseId);
      setReviews(reviewsData.content);
      const courseData = await getCourse(courseId);
      setCourse(courseData);
    } catch {
      setError("レビューの削除に失敗しました");
    }
  };

  const handleTasksChange = async () => {
    try {
      const tasksData = await getTasks(courseId);
      setTasks(tasksData);
    } catch {
      setError("課題の取得に失敗しました");
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

  const isEnrolled = enrollment !== null;

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
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    course.published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {course.published ? "公開中" : "非公開"}
                </span>
                {isEnrolled && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                    {enrollment.status === "COMPLETED" ? "完了" : "受講中"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {isAdmin ? (
                <>
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
                </>
              ) : (
                <>
                  {isEnrolled ? (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/courses/${courseId}/learn`)}
                      >
                        学習を続ける
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleUnenroll}
                        loading={enrollLoading}
                      >
                        受講取消
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleEnroll}
                      loading={enrollLoading}
                    >
                      このコースを受講する
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <p className="text-foreground/70 whitespace-pre-wrap">
            {course.description}
          </p>

          {course.averageRating != null && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(course.averageRating)} size="sm" />
              <span className="text-sm text-foreground/60">
                {course.averageRating.toFixed(1)} ({course.reviewCount}件)
              </span>
            </div>
          )}

          <div className="flex gap-4 text-xs text-foreground/40">
            <span>
              レッスン数: {lessons.length}
            </span>
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

      <TaskList
        courseId={courseId}
        tasks={tasks}
        isAdmin={isAdminOrInstructor}
        isEnrolled={isEnrolled}
        onTasksChange={handleTasksChange}
      />

      {/* レビューセクション */}
      <Card>
        <h2 className="text-lg font-bold text-foreground mb-4">レビュー</h2>

        {isEnrolled && (
          <div className="mb-6 p-4 border border-foreground/10 rounded-lg">
            <h3 className="text-sm font-medium text-foreground mb-2">
              {myReview ? "レビューを編集" : "レビューを投稿"}
            </h3>
            <div className="mb-3">
              <StarRating
                rating={reviewRating}
                interactive
                onChange={setReviewRating}
              />
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="コメントを入力（任意）"
              rows={3}
              className="w-full px-3 py-2 border border-foreground/20 rounded-lg text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleReviewSubmit}
                loading={reviewSubmitting}
                disabled={reviewRating === 0}
              >
                {myReview ? "更新" : "投稿"}
              </Button>
              {myReview && (
                <Button variant="outline" onClick={handleReviewDelete}>
                  削除
                </Button>
              )}
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-foreground/50">レビューはまだありません</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-3 border border-foreground/10 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {review.userName}
                  </span>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground/70">{review.comment}</p>
                )}
                <p className="text-xs text-foreground/40 mt-1">
                  {new Date(review.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
