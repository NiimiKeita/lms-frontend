import api from "@/lib/api";
import type {
  Enrollment,
  MessageResponse,
} from "@/types/enrollment";
import type { PageResponse } from "@/types/course";

// ===== Enrollment API =====

export async function enroll(courseId: number): Promise<Enrollment> {
  const response = await api.post<Enrollment>(`/courses/${courseId}/enroll`);
  return response.data;
}

export async function unenroll(courseId: number): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(`/courses/${courseId}/enroll`);
  return response.data;
}

export async function getEnrollment(courseId: number): Promise<Enrollment> {
  const response = await api.get<Enrollment>(`/courses/${courseId}/enrollment`);
  return response.data;
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const response = await api.get<Enrollment[]>("/enrollments/my");
  return response.data;
}

export async function getCourseEnrollments(
  courseId: number,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Enrollment>> {
  const response = await api.get<PageResponse<Enrollment>>(
    `/courses/${courseId}/enrollments`,
    { params: { page, size } }
  );
  return response.data;
}
