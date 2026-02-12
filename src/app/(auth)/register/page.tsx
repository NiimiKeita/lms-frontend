"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setLoading(true);
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("登録に失敗しました。もう一度お試しください");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">新規登録</h1>
          <p className="text-sm text-foreground/60 mt-2">
            SkillBridge LMS アカウントを作成
          </p>
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
            error={errors.username?.message}
            {...register("username")}
          />
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
            placeholder="8文字以上（英字+数字）"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="パスワード（確認）"
            type="password"
            placeholder="パスワードを再入力"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" loading={loading} className="w-full">
            登録する
          </Button>
        </form>

        <p className="text-center text-sm text-foreground/60 mt-6">
          既にアカウントをお持ちですか？{" "}
          <Link
            href="/login"
            className="text-foreground font-medium hover:underline"
          >
            ログイン
          </Link>
        </p>
      </Card>
    </div>
  );
}
