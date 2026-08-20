"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { updateCompany } from "../api/companyApi";
import {
  Company,
  UpdateCompanyPayload,
} from "../types/company.types";
import CompanyForm from "./CompanyForm";

interface EditCompanyModalProps {
  open: boolean;
  onClose: () => void;
  company: Company | null;
}

export default function EditCompanyModal({
  open,
  onClose,
  company,
}: EditCompanyModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateCompanyPayload>({
    name: "",
    domain: "",
    industry: "",
    company_size: "",
    website: "",
    notes: "",
    status: "",
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        domain: company.domain ?? "",
        industry: company.industry ?? "",
        company_size: company.company_size ?? "",
        website: company.website ?? "",
        notes: company.notes ?? "",
        status: company.status,
      });
    }
  }, [company]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!company) return;
    if (!form.name?.trim()) {
      alert("Company name is required");
      return;
    }

    try {
      setLoading(true);
      await updateCompany(company.id, {
        name: form.name.trim(),
        domain: form.domain?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        company_size: form.company_size?.trim() || undefined,
        website: form.website?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        status: form.status?.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Edit Company</h2>
          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <CompanyForm
          form={form}
          onChange={handleChange}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-5 py-2">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Company"}
          </button>
        </div>
      </div>
    </div>
  );
}
