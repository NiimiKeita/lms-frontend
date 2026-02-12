import api from "./api";
import type { Review, CreateReviewRequest } from "@/types/review";
import type { PageResponse } from "@/types/course";

export async function getReviews(
  courseId: number,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Review>> {
  const response = await api.get<PageResponse<Review>>(
    `/courses/${courseId}/reviews`,
    { params: { page, size } }
  );
  return response.data;
}

export async function getMyReview(courseId: number): Promise<Review> {
  const response = await api.get<Review>(`/courses/${courseId}/reviews/my`);
  return response.data;
}

export async function createReview(
  courseId: number,
  data: CreateReviewRequest
): Promise<Review> {
  const response = await api.post<Review>(
    `/courses/${courseId}/reviews`,
    data
  );
  return response.data;
}

export async function updateReview(
  courseId: number,
  data: CreateReviewRequest
): Promise<Review> {
  const response = await api.put<Review>(
    `/courses/${courseId}/reviews/my`,
    data
  );
  return response.data;
}

export async function deleteReview(courseId: number): Promise<void> {
  await api.delete(`/courses/${courseId}/reviews/my`);
}
