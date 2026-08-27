"use client";

import type {
  CreateStagePayload,
  PipelineStageType,
  UpdateStagePayload,
} from "../types/pipeline.types";

const STAGE_TYPES: PipelineStageType[] = ["NORMAL", "OPEN", "WON", "LOST"];

interface PipelineStageFormProps {
  form: CreateStagePayload | UpdateStagePayload;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onToggleActive?: (checked: boolean) => void;
}

export default function PipelineStageForm({
  form,
  onChange,
  onToggleActive,
}: PipelineStageFormProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Stage Name
        </label>
        <input
          type="text"
          name="name"
          placeholder="Stage Name"
          value={form.name ?? ""}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Position
        </label>
        <input
          type="number"
          name="position"
          min={0}
          step={1}
          value={form.position ?? 0}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Color
        </label>
        <input
          type="color"
          name="color"
          value={form.color ?? "#64748b"}
          onChange={onChange}
          className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Stage Type
        </label>
        <select
          name="stage_type"
          value={form.stage_type ?? "NORMAL"}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {STAGE_TYPES.map((stageType) => (
            <option key={stageType} value={stageType}>
              {stageType}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Probability (%)
        </label>
        <input
          type="number"
          name="probability"
          min={0}
          max={100}
          step={1}
          value={form.probability ?? 0}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          SLA Days
        </label>
        <input
          type="number"
          name="sla_days"
          min={0}
          step={1}
          value={form.sla_days ?? 0}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {typeof onToggleActive === "function" && (
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={Boolean((form as UpdateStagePayload).is_active ?? true)}
              onChange={(event) => onToggleActive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Active
          </label>
        </div>
      )}
    </div>
  );
}
