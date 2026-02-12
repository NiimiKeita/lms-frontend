export interface Review {
  id: number;
  courseId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}
