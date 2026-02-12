"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/types/task";
import type { TaskFormData } from "@/lib/validations";
import { createTask, updateTask, deleteTask } from "@/lib/taskApi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TaskForm from "@/components/tasks/TaskForm";

interface TaskListProps {
  courseId: number;
  tasks: Task[];
  isAdmin: boolean;
  isEnrolled: boolean;
  onTasksChange: () => void;
}

export default function TaskList({
  courseId,
  tasks,
  isAdmin,
  isEnrolled,
  onTasksChange,
}: TaskListProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreateTask = async (data: TaskFormData) => {
    setError("");
    try {
      await createTask(courseId, {
        title: data.title,
        description: data.description || undefined,
        sortOrder: tasks.length + 1,
      });
      setShowAddForm(false);
      onTasksChange();
    } catch {
      setError("課題の作成に失敗しました");
    }
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    setError("");
    try {
      await updateTask(courseId, editingTask.id, {
        title: data.title,
        description: data.description || undefined,
      });
      setEditingTask(null);
      onTasksChange();
    } catch {
      setError("課題の更新に失敗しました");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("この課題を削除してもよろしいですか？")) return;
    setError("");
    setDeletingId(taskId);
    try {
      await deleteTask(courseId, taskId);
      onTasksChange();
    } catch {
      setError("課題の削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">課題</h2>
        {isAdmin && !showAddForm && (
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddForm(true);
              setEditingTask(null);
            }}
          >
            課題追加
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card>
          <h3 className="font-semibold mb-4">新しい課題</h3>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowAddForm(false)}
            submitLabel="追加"
          />
        </Card>
      )}

      {sortedTasks.length > 0 ? (
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <Card key={task.id} className="!p-4">
              {editingTask?.id === task.id ? (
                <div>
                  <h3 className="font-semibold mb-4">課題編集</h3>
                  <TaskForm
                    defaultValues={{
                      title: task.title,
                      description: task.description || "",
                    }}
                    onSubmit={handleUpdateTask}
                    onCancel={() => setEditingTask(null)}
                    submitLabel="更新"
                  />
                </div>
              ) : (
                <div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedTask(
                        expandedTask === task.id ? null : task.id
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground/40 font-mono w-6 text-center">
                        {task.sortOrder}
                      </span>
                      <span className="font-medium text-foreground">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-foreground/40 text-sm">
                      {expandedTask === task.id ? "閉じる" : "詳細"}
                    </span>
                  </div>

                  {expandedTask === task.id && (
                    <div className="mt-3 pt-3 border-t border-foreground/10 space-y-2">
                      {task.description && (
                        <p className="text-sm text-foreground/60 whitespace-pre-wrap">
                          {task.description}
                        </p>
                      )}
                      <p className="text-sm text-foreground/60">
                        <span className="font-medium">作成日:</span>{" "}
                        {new Date(task.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                      <div className="flex gap-2 pt-2">
                        {isAdmin && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTask(task);
                                setShowAddForm(false);
                              }}
                            >
                              編集
                            </Button>
                            <Button
                              variant="outline"
                              loading={deletingId === task.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                            >
                              削除
                            </Button>
                          </>
                        )}
                        {isEnrolled && (
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/courses/${courseId}/tasks/${task.id}`
                              );
                            }}
                          >
                            提出する
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        !showAddForm && (
          <p className="text-sm text-foreground/60 py-4">
            課題はまだありません
          </p>
        )
      )}
    </div>
  );
}
