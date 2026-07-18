"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { updateLead } from "../api/leadApi";
import { Lead, UpdateLeadPayload } from "../types/lead.types";
import LeadForm from "./LeadForm";

interface EditLeadModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export default function EditLeadModal({
  open,
  onClose,
  lead,
}: EditLeadModalProps) {
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<UpdateLeadPayload>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    notes: "",
    status: "",
  });

  useEffect(() => {
    if (lead) {
      setForm({
        first_name: lead.first_name,
        last_name: lead.last_name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        company: lead.company ?? "",
        source: lead.source ?? "",
        notes: lead.notes ?? "",
        status: lead.status,
      });
    }
  }, [lead]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!lead) return;

    try {
      setLoading(true);

      const payload: UpdateLeadPayload = {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        company: form.company?.trim() || undefined,
        source: form.source?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        status: form.status?.trim() || undefined,
      };

      await updateLead(lead.id, payload);

      await queryClient.invalidateQueries({
        queryKey: ["leads"],
      });

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Edit Lead
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <LeadForm
          form={form}
          onChange={handleChange}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}