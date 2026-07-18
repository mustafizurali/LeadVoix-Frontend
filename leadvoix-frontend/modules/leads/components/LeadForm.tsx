"use client";

import { CreateLeadPayload } from "../types/lead.types";

interface LeadFormProps {
  form: CreateLeadPayload;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function LeadForm({
  form,
  onChange,
}: LeadFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        value={form.first_name}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="text"
        name="last_name"
        placeholder="Last Name"
        value={form.last_name ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={form.phone ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="text"
        name="company"
        placeholder="Company"
        value={form.company ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="text"
        name="source"
        placeholder="Source"
        value={form.source ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <div className="col-span-2">
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes ?? ""}
          onChange={onChange}
          rows={4}
          className="w-full rounded-lg border p-2"
        />
      </div>
    </div>
  );
}