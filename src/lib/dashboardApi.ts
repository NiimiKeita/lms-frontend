import api from "./api";
import type {
  LearnerDashboardResponse,
  InstructorDashboardResponse,
} from "@/types/dashboard";

export const getLearnerDashboard =
  async (): Promise<LearnerDashboardResponse> => {
    const response = await api.get("/dashboard/learner");
    return response.data;
  };

export const getInstructorDashboard =
  async (): Promise<InstructorDashboardResponse> => {
    const response = await api.get("/dashboard/instructor");
    return response.data;
  };
