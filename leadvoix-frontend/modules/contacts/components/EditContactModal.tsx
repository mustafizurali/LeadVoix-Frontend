"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { updateContact } from "../api/contactApi";
import {
  CreateContactPayload,
  Contact,
  UpdateContactPayload,
} from "../types/contact.types";

import ContactForm from "./ContactForm";

interface EditContactModalProps {
  open: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export default function EditContactModal({
  open,
  onClose,
  contact,
}: EditContactModalProps) {
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<UpdateContactPayload>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    status: "",
  });

  useEffect(() => {
    if (contact) {
      setForm({
        first_name: contact.first_name,
        last_name: contact.last_name ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        company: contact.company ?? "",
        status: contact.status,
      });
    }
  }, [contact]);

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
    if (!contact) return;

    if (!form.first_name?.trim()) {
      alert("First Name is required");
      return;
    }

    try {
      setLoading(true);

      const payload: UpdateContactPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name?.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        company: form.company?.trim() || undefined,
        status: form.status?.trim() || undefined,
      };

      await updateContact(contact.id, payload);

      await queryClient.invalidateQueries({
        queryKey: ["contacts"],
      });

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update contact");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Edit Contact
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <ContactForm
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
            {loading ? "Updating..." : "Update Contact"}
          </button>
        </div>

      </div>
    </div>
  );
}