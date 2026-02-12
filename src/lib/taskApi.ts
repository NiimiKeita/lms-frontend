import api from "@/lib/api";
import type { PageResponse } from "@/types/course";
import type {
  Task,
  TaskSubmission,
  TaskFeedback,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateSubmissionRequest,
  UpdateSubmissionStatusRequest,
  CreateFeedbackRequest,
} from "@/types/task";

// ===== Task API =====

export async function getTasks(courseId: number): Promise<Task[]> {
  const response = await api.get<Task[]>(`/courses/${courseId}/tasks`);
  return response.data;
}

export async function getTask(courseId: number, taskId: number): Promise<Task> {
  const response = await api.get<Task>(`/courses/${courseId}/tasks/${taskId}`);
  return response.data;
}

export async function createTask(
  courseId: number,
  data: CreateTaskRequest
): Promise<Task> {
  const response = await api.post<Task>(`/courses/${courseId}/tasks`, data);
  return response.data;
}

export async function updateTask(
  courseId: number,
  taskId: number,
  data: UpdateTaskRequest
): Promise<Task> {
  const response = await api.put<Task>(
    `/courses/${courseId}/tasks/${taskId}`,
    data
  );
  return response.data;
}

export async function deleteTask(
  courseId: number,
  taskId: number
): Promise<void> {
  await api.delete(`/courses/${courseId}/tasks/${taskId}`);
}

// ===== Submission API =====

export async function submitTask(
  taskId: number,
  data: CreateSubmissionRequest
): Promise<TaskSubmission> {
  const response = await api.post<TaskSubmission>(
    `/tasks/${taskId}/submissions`,
    data
  );
  return response.data;
}

export async function getMySubmissions(
  taskId: number
): Promise<TaskSubmission[]> {
  const response = await api.get<TaskSubmission[]>(
    `/tasks/${taskId}/submissions/my`
  );
  return response.data;
}

export async function getSubmissions(
  taskId: number,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<TaskSubmission>> {
  const params = { page, size };
  const response = await api.get<PageResponse<TaskSubmission>>(
    `/tasks/${taskId}/submissions`,
    { params }
  );
  return response.data;
}

export async function getSubmission(
  submissionId: number
): Promise<TaskSubmission> {
  const response = await api.get<TaskSubmission>(
    `/tasks/submissions/${submissionId}`
  );
  return response.data;
}

export async function updateSubmissionStatus(
  submissionId: number,
  data: UpdateSubmissionStatusRequest
): Promise<TaskSubmission> {
  const response = await api.patch<TaskSubmission>(
    `/tasks/submissions/${submissionId}/status`,
    data
  );
  return response.data;
}

export async function addFeedback(
  submissionId: number,
  data: CreateFeedbackRequest
): Promise<TaskFeedback> {
  const response = await api.post<TaskFeedback>(
    `/tasks/submissions/${submissionId}/feedback`,
    data
  );
  return response.data;
}
