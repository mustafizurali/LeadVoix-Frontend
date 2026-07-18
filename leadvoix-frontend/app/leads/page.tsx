"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import LeadToolbar from "@/modules/leads/components/LeadToolbar";
import LeadTable from "@/modules/leads/components/LeadTable";
import CreateLeadModal from "@/modules/leads/components/CreateLeadModal";
import EditLeadModal from "@/modules/leads/components/EditLeadModal";

import { deleteLead } from "@/modules/leads/api/leadApi";
import { Lead } from "@/modules/leads/types/lead.types";

export default function LeadsPage() {
  const queryClient = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedLead(null);
  };

  const handleDeleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lead.first_name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteLead(lead.id);

      await queryClient.invalidateQueries({
        queryKey: ["leads"],
      });

      alert("Lead deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete lead.");
    }
  };

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

        <LeadToolbar
          onCreateLead={() => setOpenCreate(true)}
        />

        <LeadTable
          onEditLead={handleEditLead}
          onDeleteLead={handleDeleteLead}
        />
      </div>

      <CreateLeadModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />

      <EditLeadModal
        open={openEdit}
        onClose={handleCloseEdit}
        lead={selectedLead}
      />
    </DashboardLayout>
  );
}