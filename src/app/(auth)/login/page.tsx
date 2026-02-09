"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);
    try {
      await login(data);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else {
        setError("ログインに失敗しました。もう一度お試しください");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">ログイン</h1>
          <p className="text-sm text-foreground/60 mt-2">
            SkillBridge LMS にログイン
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
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="パスワード"
            type="password"
            placeholder="パスワードを入力"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              パスワードをお忘れですか？
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            ログイン
          </Button>
        </form>

        <p className="text-center text-sm text-foreground/60 mt-6">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/register"
            className="text-foreground font-medium hover:underline"
          >
            新規登録
          </Link>
        </p>
      </Card>
    </div>
  );
}
