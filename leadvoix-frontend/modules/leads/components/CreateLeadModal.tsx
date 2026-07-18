"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreateLeadPayload } from "../types/lead.types";
import { createLead } from "../api/leadApi";

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateLeadModal({
  open,
  onClose,
}: CreateLeadModalProps) {
  const [form, setForm] = useState<CreateLeadPayload>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
    const handleSubmit = async () => {
    try {
    setLoading(true);
    if (!form.first_name.trim()) {
    alert("First Name is required");
   return;
   }
    const payload: CreateLeadPayload = {
   first_name: form.first_name,
   last_name: form.last_name || undefined,
   email: form.email || undefined,
   phone: form.phone || undefined,
   company: form.company || undefined,
   source: form.source || undefined,
   notes: form.notes || undefined,
   };

   await createLead(payload);

    await queryClient.invalidateQueries({
      queryKey: ["leads"],
    });

    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      source: "",
      notes: "",
    });

    onClose();
  } catch (error) {
    console.error(error);
    alert("Failed to create lead");
  } finally {
    setLoading(false);
  }
};
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Create New Lead
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="text"
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <input
            type="text"
            name="source"
            placeholder="Source"
            value={form.source}
            onChange={handleChange}
            className="rounded-lg border p-2"
          />

          <div className="col-span-2">
            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border p-2"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
             onClick={handleSubmit}
              disabled={loading || !form.first_name.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}