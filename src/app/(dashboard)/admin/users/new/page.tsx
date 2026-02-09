"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminCreateUserSchema, type AdminCreateUserFormData } from "@/lib/validations";
import { useAuth } from "@/context/AuthContext";
import { createAdminUser } from "@/lib/adminApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { AxiosError } from "axios";

export default function NewUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminCreateUserFormData>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: { role: "LEARNER" },
  });

  if (user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const onSubmit = async (data: AdminCreateUserFormData) => {
    setError("");
    setLoading(true);
    try {
      await createAdminUser(data);
      router.push("/admin/users");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("ユーザーの作成に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin/users")}
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          ユーザー管理
        </button>
        <span className="text-foreground/40">/</span>
        <span className="text-sm text-foreground">新規追加</span>
      </div>

      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">ユーザー新規追加</h1>
          <p className="text-sm text-foreground/60 mt-2">
            新しいユーザーの情報を入力してください
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="メールアドレス"
            type="email"
            placeholder="user@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="ユーザー名"
            type="text"
            placeholder="ユーザー名を入力"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="パスワード"
            type="password"
            placeholder="8文字以上"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground/80">
              ロール
            </label>
            <select
              className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 ${
                errors.role ? "border-red-500 focus:ring-red-200" : "border-foreground/20"
              }`}
              {...register("role")}
            >
              <option value="LEARNER">受講者</option>
              <option value="INSTRUCTOR">講師</option>
              <option value="ADMIN">管理者</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              作成する
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
