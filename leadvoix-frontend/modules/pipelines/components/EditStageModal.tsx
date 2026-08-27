"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { updatePipelineStage } from "../api/pipelineApi";
import type { PipelineStage, PipelineStageType, UpdateStagePayload } from "../types/pipeline.types";
import PipelineStageForm from "./PipelineStageForm";

interface EditStageModalProps {
  open: boolean;
  onClose: () => void;
  stage: PipelineStage | null;
}

const emptyForm: UpdateStagePayload = {
  name: "",
  position: 0,
  color: "#64748b",
  stage_type: "NORMAL",
  probability: 0,
  sla_days: 0,
  is_active: true,
};

export default function EditStageModal({
  open,
  onClose,
  stage,
}: EditStageModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateStagePayload>(emptyForm);

  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name,
        position: stage.position,
        color: stage.color ?? "#64748b",
        stage_type: stage.stage_type,
        probability: stage.probability,
        sla_days: stage.sla_days,
        is_active: stage.is_active,
      });
    }
  }, [stage]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleSubmit = async () => {
    if (!stage) return;
    if (!form.name?.trim()) {
      alert("Stage name is required");
      return;
    }

    try {
      setLoading(true);
      await updatePipelineStage(stage.id, {
        name: form.name.trim(),
        position: typeof form.position === "number" ? form.position : undefined,
        color: form.color || undefined,
        stage_type: form.stage_type,
        probability: typeof form.probability === "number" ? form.probability : undefined,
        sla_days: typeof form.sla_days === "number" ? form.sla_days : undefined,
        is_active: typeof form.is_active === "boolean" ? form.is_active : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["pipeline-stages"],});
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update pipeline stage");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Stage</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-500 transition hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <PipelineStageForm
          form={form}
          onChange={handleChange}
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
            {loading ? "Updating..." : "Update Stage"}
          </button>
        </div>
      </div>
    </div>
  );
}
