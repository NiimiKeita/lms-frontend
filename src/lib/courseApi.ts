import api from "@/lib/api";
import type {
  Course,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  PageResponse,
  Lesson,
  CreateLessonRequest,
  UpdateLessonRequest,
  ReorderLessonRequest,
} from "@/types/course";

// ===== Course API =====

export async function getCourses(
  page: number = 0,
  size: number = 10,
  keyword?: string,
  status?: string,
  sort?: string
): Promise<PageResponse<Course>> {
  const params: Record<string, string | number> = { page, size };
  if (keyword) {
    params.keyword = keyword;
  }
  if (status) {
    params.status = status;
  }
  if (sort) {
    params.sort = sort;
  }
  const response = await api.get<PageResponse<Course>>("/courses", { params });
  return response.data;
}

export async function getCourse(id: number): Promise<CourseResponse> {
  const response = await api.get<CourseResponse>(`/courses/${id}`);
  return response.data;
}

export async function createCourse(
  data: CreateCourseRequest
): Promise<CourseResponse> {
  const response = await api.post<CourseResponse>("/courses", data);
  return response.data;
}

export async function updateCourse(
  id: number,
  data: UpdateCourseRequest
): Promise<CourseResponse> {
  const response = await api.put<CourseResponse>(`/courses/${id}`, data);
  return response.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export async function togglePublish(id: number): Promise<CourseResponse> {
  const response = await api.patch<CourseResponse>(`/courses/${id}/publish`);
  return response.data;
}

// ===== Lesson API =====

export async function getLessons(courseId: number): Promise<Lesson[]> {
  const response = await api.get<Lesson[]>(`/courses/${courseId}/lessons`);
  return response.data;
}

export async function getLesson(
  courseId: number,
  id: number
): Promise<Lesson> {
  const response = await api.get<Lesson>(
    `/courses/${courseId}/lessons/${id}`
  );
  return response.data;
}

export async function createLesson(
  courseId: number,
  data: CreateLessonRequest
): Promise<Lesson> {
  const response = await api.post<Lesson>(
    `/courses/${courseId}/lessons`,
    data
  );
  return response.data;
}

export async function updateLesson(
  courseId: number,
  id: number,
  data: UpdateLessonRequest
): Promise<Lesson> {
  const response = await api.put<Lesson>(
    `/courses/${courseId}/lessons/${id}`,
    data
  );
  return response.data;
}

export async function deleteLesson(
  courseId: number,
  id: number
): Promise<void> {
  await api.delete(`/courses/${courseId}/lessons/${id}`);
}

export async function reorderLessons(
  courseId: number,
  orders: ReorderLessonRequest[]
): Promise<void> {
  await api.patch(`/courses/${courseId}/lessons/reorder`, orders);
}

// ===== Content API =====

export interface LessonContent {
  lessonId: number;
  title: string;
  content: string;
  orderIndex: number;
}

export async function getLessonContent(
  courseId: number,
  lessonId: number
): Promise<LessonContent> {
  const response = await api.get<LessonContent>(
    `/courses/${courseId}/lessons/${lessonId}/content`
  );
  return response.data;
}
