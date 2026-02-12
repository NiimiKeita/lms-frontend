"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { AxiosError } from "axios";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      router.push("/login");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("パスワードリセットに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-foreground/60">無効なリンクです。</p>
        <Link
          href="/forgot-password"
          className="text-foreground font-medium hover:underline"
        >
          パスワードリセットをやり直す
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="新しいパスワード"
          type="password"
          placeholder="8文字以上（英字+数字）"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <Input
          label="パスワード（確認）"
          type="password"
          placeholder="パスワードを再入力"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={loading} className="w-full">
          パスワードを再設定
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            パスワード再設定
          </h1>
          <p className="text-sm text-foreground/60 mt-2">
            新しいパスワードを設定してください
          </p>
        </div>

        <Suspense fallback={<div className="text-center">読み込み中...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}
