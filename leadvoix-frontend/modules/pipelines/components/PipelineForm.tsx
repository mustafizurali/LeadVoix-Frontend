"use client";

import type {
  CreatePipelinePayload,
  UpdatePipelinePayload,
} from "../types/pipeline.types";

interface PipelineFormProps {
  form: CreatePipelinePayload | UpdatePipelinePayload;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onToggleDefault?: (checked: boolean) => void;
  onToggleActive?: (checked: boolean) => void;
}

export default function PipelineForm({
  form,
  onChange,
  onToggleDefault,
  onToggleActive,
}: PipelineFormProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Pipeline Name
        </label>
        <input
          type="text"
          name="name"
          placeholder="Pipeline Name"
          value={form.name ?? ""}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description ?? ""}
          onChange={onChange}
          className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Color
        </label>
        <input
          type="color"
          name="color"
          value={form.color ?? "#3b82f6"}
          onChange={onChange}
          className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
        />
      </div>

      <div className="flex items-end gap-3">
        {typeof onToggleDefault === "function" && (
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean((form as UpdatePipelinePayload).is_default ?? false)}
              onChange={(event) => onToggleDefault(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Default
          </label>
        )}

        {typeof onToggleActive === "function" && (
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean((form as UpdatePipelinePayload).is_active ?? true)}
              onChange={(event) => onToggleActive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Active
          </label>
        )}
      </div>
    </div>
  );
}
