"use client";

import {
  CreateContactPayload,
  UpdateContactPayload,
} from "../types/contact.types";

interface ContactFormProps {
  form: CreateContactPayload | UpdateContactPayload;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function ContactForm({
  form,
  onChange,
}: ContactFormProps) {
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

      <div className="col-span-2">
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={form.company ?? ""}
          onChange={onChange}
          className="w-full rounded-lg border p-2"
        />
      </div>
    </div>
  );
}