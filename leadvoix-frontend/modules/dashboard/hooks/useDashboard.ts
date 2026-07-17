import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboardApi";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });
};