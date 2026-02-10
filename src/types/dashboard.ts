import type { CourseProgress } from "./enrollment";

export interface PendingTaskItem {
  taskId: number;
  taskTitle: string;
  courseId: number;
  courseTitle: string;
}

export interface RecentFeedbackItem {
  submissionId: number;
  taskTitle: string;
  reviewerName: string;
  comment: string;
  createdAt: string;
}

export interface LearnerDashboardResponse {
  enrolledCourses: CourseProgress[];
  pendingTasks: PendingTaskItem[];
  recentFeedbacks: RecentFeedbackItem[];
}

export interface RecentSubmissionItem {
  submissionId: number;
  taskTitle: string;
  learnerName: string;
  status: string;
  submittedAt: string;
}

export interface InstructorDashboardResponse {
  unreviewedCount: number;
  recentSubmissions: RecentSubmissionItem[];
}
