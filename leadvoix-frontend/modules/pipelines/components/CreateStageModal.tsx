"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createPipelineStage } from "../api/pipelineApi";
import type {
  CreateStagePayload,
  PipelineStageType,
} from "../types/pipeline.types";
import PipelineStageForm from "./PipelineStageForm";

interface CreateStageModalProps {
  open: boolean;
  onClose: () => void;
  pipelineId: number;
}

const getEmptyForm = (
  pipelineId: number
): CreateStagePayload => ({
  pipeline_id: pipelineId,
  name: "",
  position: 0,
  color: "#64748b",
  stage_type: "NORMAL",
  probability: 0,
  sla_days: 0,
  is_active: true,
});

export default function CreateStageModal({
  open,
  onClose,
  pipelineId,
}: CreateStageModalProps) {
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CreateStagePayload>(() =>
    getEmptyForm(pipelineId)
  );

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "number"
          ? Number(value)
          : name === "stage_type"
          ? (value as PipelineStageType)
          : value,
    }));
  };

  const handleToggleActive = (checked: boolean) => {
    setForm((previous) => ({
      ...previous,
      is_active: checked,
    }));
  };

  const handleClose = () => {
    setForm(getEmptyForm(pipelineId));
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Stage name is required");
      return;
    }

    try {
      setLoading(true);

      await createPipelineStage(pipelineId, {
        pipeline_id: pipelineId,
        name: form.name.trim(),
        position: Number(form.position),
        color: form.color || undefined,
        stage_type: form.stage_type,
        probability: Number(form.probability),
        sla_days: Number(form.sla_days),
        is_active: Boolean(form.is_active),
      });

      await queryClient.invalidateQueries({
        queryKey: ["pipeline-stages"],
      });

      setForm(getEmptyForm(pipelineId));

      onClose();
    } catch (error) {
      console.error("Failed to create pipeline stage:", error);

      alert("Failed to create pipeline stage");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Create Stage
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a new stage to this pipeline.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-2xl text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <PipelineStageForm
          form={form}
          onChange={handleChange}
          onToggleActive={handleToggleActive}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Stage"}
          </button>
        </div>
      </div>
    </div>
  );
}