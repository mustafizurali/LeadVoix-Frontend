"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createPipeline } from "../api/pipelineApi";
import type { CreatePipelinePayload } from "../types/pipeline.types";
import PipelineForm from "./PipelineForm";

interface CreatePipelineModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm: CreatePipelinePayload = {
  name: "",
  description: "",
  color: "#3b82f6",
  is_default: false,
  is_active: true,
};

export default function CreatePipelineModal({
  open,
  onClose,
}: CreatePipelineModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreatePipelinePayload>(emptyForm);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Pipeline name is required");
      return;
    }

    try {
      setLoading(true);
      await createPipeline({
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        color: form.color || undefined,
        is_default: Boolean(form.is_default),
        is_active: Boolean(form.is_active ?? true),
      });

      await queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      setForm(emptyForm);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create pipeline");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Create New Pipeline</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-500 transition hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <PipelineForm
          form={form}
          onChange={handleChange}
          onToggleDefault={(checked) => setForm((previous) => ({ ...previous, is_default: checked }))}
          onToggleActive={(checked) => setForm((previous) => ({ ...previous, is_active: checked }))}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Pipeline"}
          </button>
        </div>
      </div>
    </div>
  );
}
