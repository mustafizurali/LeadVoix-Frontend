"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { updatePipeline } from "../api/pipelineApi";
import type { Pipeline, UpdatePipelinePayload } from "../types/pipeline.types";
import PipelineForm from "./PipelineForm";

interface EditPipelineModalProps {
  open: boolean;
  onClose: () => void;
  pipeline: Pipeline | null;
}

const emptyForm: UpdatePipelinePayload = {
  name: "",
  description: "",
  color: "#3b82f6",
  is_default: false,
  is_active: true,
};

export default function EditPipelineModal({
  open,
  onClose,
  pipeline,
}: EditPipelineModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdatePipelinePayload>(emptyForm);

  useEffect(() => {
    if (pipeline) {
      setForm({
        name: pipeline.name,
        description: pipeline.description ?? "",
        color: pipeline.color ?? "#3b82f6",
        is_default: pipeline.is_default,
        is_active: pipeline.is_active,
      });
    }
  }, [pipeline]);

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
    if (!pipeline) return;
    if (!form.name?.trim()) {
      alert("Pipeline name is required");
      return;
    }

    try {
      setLoading(true);
      await updatePipeline(pipeline.id, {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        color: form.color || undefined,
        is_default: typeof form.is_default === "boolean" ? form.is_default : undefined,
        is_active: typeof form.is_active === "boolean" ? form.is_active : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update pipeline");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !pipeline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Pipeline</h2>
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
            {loading ? "Updating..." : "Update Pipeline"}
          </button>
        </div>
      </div>
    </div>
  );
}
