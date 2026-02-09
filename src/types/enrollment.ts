export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";

export interface Enrollment {
  id: number;
  userId: number;
  username: string;
  courseId: number;
  courseTitle: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
}

export interface LessonProgress {
  lessonId: number;
  lessonTitle: string;
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
}

export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessonProgresses: LessonProgress[] | null;
}

export interface MessageResponse {
  message: string;
}
