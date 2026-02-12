import api from "./api";
import type {
  EnrollmentTrend,
  CompletionStats,
  PopularCourse,
} from "@/types/analytics";

export async function getEnrollmentTrends(
  period: string = "30d"
): Promise<EnrollmentTrend[]> {
  const response = await api.get<EnrollmentTrend[]>(
    "/admin/analytics/enrollments",
    { params: { period } }
  );
  return response.data;
}

export async function getCompletionStats(): Promise<CompletionStats[]> {
  const response = await api.get<CompletionStats[]>(
    "/admin/analytics/completions"
  );
  return response.data;
}

export async function getPopularCourses(): Promise<PopularCourse[]> {
  const response = await api.get<PopularCourse[]>(
    "/admin/analytics/popular-courses"
  );
  return response.data;
}

export async function downloadAnalyticsCsv(): Promise<void> {
  const response = await api.get("/admin/analytics/export/csv", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = "analytics-export.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
