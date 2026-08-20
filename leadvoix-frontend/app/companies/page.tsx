"use client";

import { useState } from "react";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import CompanyToolbar from "@/modules/companies/components/CompanyToolbar";
import CompanyTable from "@/modules/companies/components/CompanyTable";
import CreateCompanyModal from "@/modules/companies/components/CreateCompanyModal";
import EditCompanyModal from "@/modules/companies/components/EditCompanyModal";
import { Company } from "@/modules/companies/types/company.types";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCompany } from "@/modules/companies/api/companyApi";

export default function CompaniesPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setOpenEdit(true);
  };
  const handleDeleteCompany = async (company: Company) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${company.name}"?`
  );

  if (!confirmed) return;

  try {
    await deleteCompany(company.id);

    await queryClient.invalidateQueries({
      queryKey: ["companies"],
    });

    alert("Company deleted successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to delete company.");
  }
};

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedCompany(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="mt-2 text-slate-500">
            Manage all your companies.
          </p>
        </div>

        <CompanyToolbar
          search={search}
          onSearchChange={setSearch}
          onCreateCompany={() => setOpenCreate(true)}
        />

        <CompanyTable
          search={search}
          onEditCompany={handleEditCompany}
          onDeleteCompany={handleDeleteCompany}
        />
      </div>

      <CreateCompanyModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />

      <EditCompanyModal
        open={openEdit}
        onClose={handleCloseEdit}
        company={selectedCompany}
      />
    </DashboardLayout>
  );
}
