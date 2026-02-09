"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, type CourseFormData } from "@/lib/validations";
import { useAuth } from "@/context/AuthContext";
import { createCourse } from "@/lib/courseApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { AxiosError } from "axios";

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  // ADMIN以外はリダイレクト
  if (user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const onSubmit = async (data: CourseFormData) => {
    setError("");
    setLoading(true);
    try {
      const course = await createCourse({
        title: data.title,
        description: data.description,
      });
      router.push(`/courses/${course.id}`);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("コースの作成に失敗しました。もう一度お試しください");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/courses")}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          コース一覧
        </button>
        <span className="text-foreground/40">/</span>
        <span className="text-sm text-foreground">新規作成</span>
      </div>

      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">コース新規作成</h1>
          <p className="text-sm text-foreground/60 mt-2">
            新しいコースの情報を入力してください
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="コースタイトル"
            type="text"
            placeholder="コースタイトルを入力"
            error={errors.title?.message}
            {...register("title")}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              説明
            </label>
            <textarea
              placeholder="コースの説明を入力"
              rows={5}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-vertical ${
                errors.description
                  ? "border-red-500 focus:ring-red-200"
                  : "border-foreground/20"
              }`}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              作成する
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/courses")}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
