"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackFormData } from "@/lib/validations";
import { useAuth } from "@/context/AuthContext";
import {
  getSubmission,
  updateSubmissionStatus,
  addFeedback,
} from "@/lib/taskApi";
import type { TaskSubmission, SubmissionStatus } from "@/types/task";
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

export default function SubmissionReviewPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = Number(params.id);
  const { user } = useAuth();
  const isAdminOrInstructor = user?.role === "ADMIN" || user?.role === "INSTRUCTOR";

  const [submission, setSubmission] = useState<TaskSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  if (!isAdminOrInstructor) {
    router.push("/dashboard");
    return null;
  }

  const fetchSubmission = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSubmission(submissionId);
      setSubmission(data);
    } catch {
      setError("提出情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleStatusChange = async (status: SubmissionStatus) => {
    setStatusLoading(true);
    setError("");
    try {
      await updateSubmissionStatus(submissionId, { status });
      fetchSubmission();
    } catch {
      setError("ステータスの更新に失敗しました");
    } finally {
      setStatusLoading(false);
    }
  };

  const onSubmitFeedback = async (data: FeedbackFormData) => {
    setFeedbackLoading(true);
    setError("");
    try {
      await addFeedback(submissionId, data);
      reset();
      fetchSubmission();
    } catch {
      setError("フィードバックの送信に失敗しました");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin/submissions")}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          提出管理
        </button>
        <span className="text-foreground/40">/</span>
        <span className="text-sm text-foreground">提出 #{submission.id}</span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <Card>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              {submission.taskTitle}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_COLORS[submission.status] || ""
              }`}
            >
              {STATUS_LABELS[submission.status] || submission.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-foreground/60">受講者: </span>
              <span className="text-foreground font-medium">{submission.userName}</span>
            </div>
            <div>
              <span className="text-foreground/60">提出日: </span>
              <span className="text-foreground">
                {new Date(submission.submittedAt).toLocaleString("ja-JP")}
              </span>
            </div>
          </div>
          <div>
            <span className="text-sm text-foreground/60">GitHub URL: </span>
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {submission.githubUrl}
            </a>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-foreground mb-4">ステータス変更</h2>
        <div className="flex gap-2">
          {(["REVIEWING", "APPROVED", "REJECTED"] as SubmissionStatus[]).map(
            (status) => (
              <Button
                key={status}
                variant={submission.status === status ? "primary" : "outline"}
                onClick={() => handleStatusChange(status)}
                loading={statusLoading}
                disabled={submission.status === status}
              >
                {STATUS_LABELS[status]}
              </Button>
            )
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-foreground mb-4">フィードバック</h2>

        {submission.feedbacks && submission.feedbacks.length > 0 && (
          <div className="space-y-3 mb-6">
            {submission.feedbacks.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-lg border border-foreground/10 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {f.reviewerName}
                  </span>
                  <span className="text-xs text-foreground/40">
                    {new Date(f.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                  {f.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmitFeedback)} className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              コメント
            </label>
            <textarea
              className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[100px] ${
                errors.comment
                  ? "border-red-500 focus:ring-red-200"
                  : "border-foreground/20"
              }`}
              placeholder="フィードバックを入力..."
              {...register("comment")}
            />
            {errors.comment && (
              <p className="text-xs text-red-500">{errors.comment.message}</p>
            )}
          </div>
          <Button type="submit" loading={feedbackLoading}>
            送信する
          </Button>
        </form>
      </Card>
    </div>
  );
}
