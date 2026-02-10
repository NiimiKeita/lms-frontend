import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードを入力してください"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "ユーザー名を入力してください")
    .max(100, "ユーザー名は100文字以内で入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "パスワードは英字と数字を含めてください"
    ),
  confirmPassword: z
    .string()
    .min(1, "パスワード（確認）を入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "パスワードは英字と数字を含めてください"
    ),
  confirmPassword: z
    .string()
    .min(1, "パスワード（確認）を入力してください"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  description: z
    .string()
    .min(1, "説明を入力してください")
    .max(2000, "説明は2000文字以内で入力してください"),
});

export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  contentPath: z
    .string()
    .min(1, "コンテンツパスを入力してください")
    .max(500, "コンテンツパスは500文字以内で入力してください"),
  published: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export const adminCreateUserSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください"),
  name: z
    .string()
    .min(1, "ユーザー名を入力してください")
    .max(100, "ユーザー名は100文字以内で入力してください"),
  role: z.enum(["ADMIN", "INSTRUCTOR", "LEARNER"], {
    message: "ロールを選択してください",
  }),
});

export const adminUpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, "ユーザー名を入力してください")
    .max(100, "ユーザー名は100文字以内で入力してください"),
  role: z.enum(["ADMIN", "INSTRUCTOR", "LEARNER"], {
    message: "ロールを選択してください",
  }),
});

export const submissionSchema = z.object({
  githubUrl: z
    .string()
    .min(1, "GitHub URLを入力してください")
    .url("有効なURLを入力してください")
    .max(500, "URLは500文字以内で入力してください"),
});

export const feedbackSchema = z.object({
  comment: z
    .string()
    .min(1, "コメントを入力してください")
    .max(5000, "コメントは5000文字以内で入力してください"),
});

export type CourseFormData = z.infer<typeof courseSchema>;
export type LessonFormData = z.infer<typeof lessonSchema>;
export type AdminCreateUserFormData = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserFormData = z.infer<typeof adminUpdateUserSchema>;
export type SubmissionFormData = z.infer<typeof submissionSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
