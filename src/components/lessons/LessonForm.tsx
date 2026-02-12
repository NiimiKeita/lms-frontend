"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema, type LessonFormData } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface LessonFormProps {
  defaultValues?: Partial<LessonFormData>;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export default function LessonForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: LessonFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      contentPath: defaultValues?.contentPath || "",
      published: defaultValues?.published ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="レッスンタイトル"
        type="text"
        placeholder="レッスンタイトルを入力"
        error={errors.title?.message}
        {...register("title")}
      />
      <Input
        label="コンテンツパス"
        type="text"
        placeholder="例: /lessons/intro.md"
        error={errors.contentPath?.message}
        {...register("contentPath")}
      />
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <input
            type="checkbox"
            className="rounded border-foreground/20"
            {...register("published")}
          />
          公開する
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
