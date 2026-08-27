"use client";

interface PipelineToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreatePipeline: () => void;
}

export default function PipelineToolbar({
  search,
  onSearchChange,
  onCreatePipeline,
}: PipelineToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <input
        type="text"
        placeholder="Search pipelines..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <button
        type="button"
        onClick={onCreatePipeline}
        className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
      >
        + New Pipeline
      </button>
    </div>
  );
}