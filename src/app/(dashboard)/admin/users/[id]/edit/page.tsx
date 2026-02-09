"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminUpdateUserSchema, type AdminUpdateUserFormData } from "@/lib/validations";
import { useAuth } from "@/context/AuthContext";
import { getAdminUser, updateAdminUser } from "@/lib/adminApi";
import type { AdminUser } from "@/types/admin";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { AxiosError } from "axios";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { user } = useAuth();
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminUpdateUserFormData>({
    resolver: zodResolver(adminUpdateUserSchema),
  });

  if (user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getAdminUser(userId);
        setTargetUser(data);
        reset({ name: data.name, role: data.role });
      } catch {
        setError("ユーザー情報の取得に失敗しました");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchUser();
  }, [userId, reset]);

  const onSubmit = async (data: AdminUpdateUserFormData) => {
    setError("");
    setLoading(true);
    try {
      await updateAdminUser(userId, data);
      router.push("/admin/users");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("ユーザーの更新に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

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
        <span className="text-sm text-foreground">編集</span>
      </div>

      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">ユーザー編集</h1>
          {targetUser && (
            <p className="text-sm text-foreground/60 mt-2">
              {targetUser.email}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="ユーザー名"
            type="text"
            placeholder="ユーザー名を入力"
            error={errors.name?.message}
            {...register("name")}
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
              更新する
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
