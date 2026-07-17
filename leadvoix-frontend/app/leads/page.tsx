"use client";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import LeadTable from "@/modules/leads/components/LeadTable";
import LeadToolbar from "@/modules/leads/components/LeadToolbar";
import CreateLeadModal from "@/modules/leads/components/CreateLeadModal";

export default function LeadsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Leads
          </h1>

          <p className="mt-2 text-slate-500">
            Manage all your sales leads.
          </p>
        </div>
         <LeadToolbar />
        <LeadTable />
      </div>
      <CreateLeadModal open={false} onClose={() => {}} />
    </DashboardLayout>
  );
}