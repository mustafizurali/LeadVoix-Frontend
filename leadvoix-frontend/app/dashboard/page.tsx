import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import DashboardGrid from "@/modules/dashboard/components/DashboardGrid";
import RecentLeads from "@/modules/dashboard/components/RecentLeads";
import ActivityFeed from "@/modules/dashboard/components/ActivityFeed";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Welcome to LeadVoix OS 🚀
          </p>
        </div>

        <DashboardGrid />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentLeads />
          </div>

          <ActivityFeed />
        </div>
      </div>
    </DashboardLayout>
  );
}