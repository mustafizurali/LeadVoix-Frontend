"use client";

import { useState } from "react";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import LeadTable from "@/modules/leads/components/LeadTable";
import LeadToolbar from "@/modules/leads/components/LeadToolbar";
import CreateLeadModal from "@/modules/leads/components/CreateLeadModal";

export default function LeadsPage() {
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>

          <p className="mt-2 text-slate-500">
            Manage all your sales leads.
          </p>
        </div>

        <LeadToolbar
          onCreateLead={() => setOpen(true)}
        />

        <LeadTable />
      </div>

      <CreateLeadModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </DashboardLayout>
  );
}