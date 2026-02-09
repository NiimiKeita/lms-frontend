// Course関連
export interface Course {
  id: number;
  title: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
}

export interface UpdateCourseRequest {
  title: string;
  description: string;
}

export interface CourseResponse extends Course {}

// Lesson関連
export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  contentPath: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonRequest {
  title: string;
  contentPath: string;
  sortOrder?: number;
  published?: boolean;
}

export interface UpdateLessonRequest {
  title: string;
  contentPath: string;
  published?: boolean;
}

export interface ReorderLessonRequest {
  lessonId: number;
  sortOrder: number;
}

// ページネーション
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
