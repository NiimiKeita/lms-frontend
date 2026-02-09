import api from "@/lib/api";
import type {
  CourseProgress,
  MessageResponse,
} from "@/types/enrollment";

// ===== Progress API =====

export async function completeLesson(
  courseId: number,
  lessonId: number
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    `/courses/${courseId}/lessons/${lessonId}/complete`
  );
  return response.data;
}

export async function uncompleteLesson(
  courseId: number,
  lessonId: number
): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(
    `/courses/${courseId}/lessons/${lessonId}/complete`
  );
  return response.data;
}

export async function getCourseProgress(
  courseId: number
): Promise<CourseProgress> {
  const response = await api.get<CourseProgress>(
    `/courses/${courseId}/progress`
  );
  return response.data;
}

export async function getMyProgress(): Promise<CourseProgress[]> {
  const response = await api.get<CourseProgress[]>("/enrollments/my/progress");
  return response.data;
}
