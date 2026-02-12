"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormData } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface TaskFormProps {
  defaultValues?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export default function TaskForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="課題タイトル"
        type="text"
        placeholder="課題タイトルを入力"
        error={errors.title?.message}
        {...register("title")}
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground/80">
          説明（任意）
        </label>
        <textarea
          className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 ${
            errors.description
              ? "border-red-500 focus:ring-red-200"
              : "border-foreground/20"
          }`}
          rows={3}
          placeholder="課題の説明を入力"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
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
