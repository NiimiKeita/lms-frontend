"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            パスワードリセット
          </h1>
          <p className="text-sm text-foreground/60 mt-2">
            登録したメールアドレスを入力してください
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
              パスワードリセットメールを送信しました。メールをご確認ください。
            </div>
            <Link
              href="/login"
              className="text-sm text-foreground font-medium hover:underline"
            >
              ログインに戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="メールアドレス"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Button type="submit" loading={loading} className="w-full">
              リセットメールを送信
            </Button>

            <p className="text-center text-sm text-foreground/60">
              <Link
                href="/login"
                className="text-foreground font-medium hover:underline"
              >
                ログインに戻る
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
