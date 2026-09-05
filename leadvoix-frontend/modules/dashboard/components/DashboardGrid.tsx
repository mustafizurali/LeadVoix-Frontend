"use client";

import StatCard from "./StatCard";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardGrid() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        Failed to load dashboard statistics.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Leads"
        value={data?.total_leads ?? 0}
        subtitle="All Leads"
      />

      <StatCard
        title="Companies"
        value={data?.total_companies ?? 0}
        subtitle="All Companies"
      />

      <StatCard
        title="Deals"
        value={data?.total_deals ?? 0}
        subtitle="All Deals"
      />

      <StatCard
        title="Tasks"
        value={data?.total_tasks ?? 0}
        subtitle="All Tasks"
      />
    </div>
  );
}