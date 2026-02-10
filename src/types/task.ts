export interface Task {
  id: number;
  courseId: number;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = "SUBMITTED" | "REVIEWING" | "APPROVED" | "REJECTED";

export interface TaskSubmission {
  id: number;
  taskId: number;
  taskTitle: string;
  userId: number;
  userName: string;
  githubUrl: string;
  status: SubmissionStatus;
  feedbacks?: TaskFeedback[];
  submittedAt: string;
  updatedAt: string;
}

export interface TaskFeedback {
  id: number;
  submissionId: number;
  reviewerId: number;
  reviewerName: string;
  comment: string;
  createdAt: string;
}

export interface CreateSubmissionRequest {
  githubUrl: string;
}

export interface UpdateSubmissionStatusRequest {
  status: SubmissionStatus;
}

export interface CreateFeedbackRequest {
  comment: string;
}
