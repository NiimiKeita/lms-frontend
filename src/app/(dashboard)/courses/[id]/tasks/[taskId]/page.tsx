"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionSchema, type SubmissionFormData } from "@/lib/validations";
import { useAuth } from "@/context/AuthContext";
import { getTask, getMySubmissions, submitTask } from "@/lib/taskApi";
import type { Task, TaskSubmission } from "@/types/task";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

export default function TaskSubmitPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);
  const taskId = Number(params.taskId);
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskData, submissionsData] = await Promise.all([
        getTask(courseId, taskId),
        getMySubmissions(taskId),
      ]);
      setTask(taskData);
      setSubmissions(submissionsData);
    } catch {
      setError("課題情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [courseId, taskId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: SubmissionFormData) => {
    setSubmitLoading(true);
    setError("");
    try {
      await submitTask(taskId, data);
      reset();
      fetchData();
    } catch {
      setError("課題の提出に失敗しました");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          コース詳細
        </button>
        <span className="text-foreground/40">/</span>
        <span className="text-sm text-foreground">{task.title}</span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <Card>
        <h1 className="text-2xl font-bold text-foreground mb-2">{task.title}</h1>
        {task.description && (
          <p className="text-foreground/70 whitespace-pre-wrap">{task.description}</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-foreground mb-4">課題を提出する</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="GitHub URL"
            type="url"
            placeholder="https://github.com/username/repo"
            error={errors.githubUrl?.message}
            {...register("githubUrl")}
          />
          <Button type="submit" loading={submitLoading}>
            提出する
          </Button>
        </form>
      </Card>

      {submissions.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-foreground mb-4">提出履歴</h2>
          <div className="space-y-3">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg border border-foreground/10"
              >
                <div className="space-y-1">
                  <a
                    href={s.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {s.githubUrl}
                  </a>
                  <p className="text-xs text-foreground/40">
                    {new Date(s.submittedAt).toLocaleString("ja-JP")}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    STATUS_COLORS[s.status] || ""
                  }`}
                >
                  {STATUS_LABELS[s.status] || s.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
