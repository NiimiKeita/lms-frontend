export interface EnrollmentTrend {
  date: string;
  count: number;
}

export interface CompletionStats {
  courseTitle: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface PopularCourse {
  courseId: number;
  courseTitle: string;
  enrollmentCount: number;
  averageRating: number | null;
}
