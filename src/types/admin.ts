// ユーザー管理
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "INSTRUCTOR" | "LEARNER";
  enabled: boolean;
  createdAt: string;
}

export interface AdminCreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "INSTRUCTOR" | "LEARNER";
}

export interface AdminUpdateUserRequest {
  name: string;
  role: "ADMIN" | "INSTRUCTOR" | "LEARNER";
}

// 管理者進捗確認
export interface UserProgressSummary {
  userId: number;
  userName: string;
  email: string;
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number;
}

export interface UserCourseProgress {
  courseId: number;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  enrolledAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  averageCompletionRate: number;
}
