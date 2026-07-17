"use client";
import StatCard from "./StatCard";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardGrid() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <p>Loading dashboard...</p>;
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
        value={data?.companies ?? 0}
        subtitle="Active Companies"
      />

      <StatCard
        title="Deals"
        value={data?.deals ?? 0}
        subtitle="Open Deals"
      />

      <StatCard
        title="Tasks"
        value={data?.tasks ?? 0}
        subtitle="Pending Tasks"
      />
    </div>
  );
}