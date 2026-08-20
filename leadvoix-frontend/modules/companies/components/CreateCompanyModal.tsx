"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createCompany } from "../api/companyApi";
import { CreateCompanyPayload } from "../types/company.types";
import CompanyForm from "./CompanyForm";

interface CreateCompanyModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm: CreateCompanyPayload = {
  name: "",
  domain: "",
  industry: "",
  company_size: "",
  website: "",
  notes: "",
};

export default function CreateCompanyModal({
  open,
  onClose,
}: CreateCompanyModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateCompanyPayload>(emptyForm);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Company name is required");
      return;
    }

    try {
      setLoading(true);
      await createCompany({
        ...form,
        domain: form.domain?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        company_size: form.company_size?.trim() || undefined,
        website: form.website?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      setForm(emptyForm);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Create New Company</h2>
          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <CompanyForm form={form} onChange={handleChange} />

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-5 py-2">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Company"}
          </button>
        </div>
      </div>
    </div>
  );
}
