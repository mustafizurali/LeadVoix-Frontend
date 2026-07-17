import api from "@/lib/api/axios";
import { DashboardStats } from "../types/dashboard.types";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/dashboard/stats");

  return response.data;
};