"use client";

import {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "../types/company.types";

interface CompanyFormProps {
  form: CreateCompanyPayload | UpdateCompanyPayload;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export default function CompanyForm({
  form,
  onChange,
}: CompanyFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <input
        type="text"
        name="name"
        placeholder="Company Name"
        value={form.name ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="text"
        name="domain"
        placeholder="Domain"
        value={form.domain ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="text"
        name="industry"
        placeholder="Industry"
        value={form.industry ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="text"
        name="company_size"
        placeholder="Company Size"
        value={form.company_size ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      <input
        type="url"
        name="website"
        placeholder="Website"
        value={form.website ?? ""}
        onChange={onChange}
        className="rounded-lg border p-2"
      />

      {"status" in form && (
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={form.status ?? ""}
          onChange={onChange}
          className="rounded-lg border p-2"
        />
      )}

      <textarea
        name="notes"
        placeholder="Notes"
        value={form.notes ?? ""}
        onChange={onChange}
        className="col-span-2 min-h-24 rounded-lg border p-2"
      />
    </div>
  );
}
