"use client";

interface LeadToolbarProps {
  onCreateLead: () => void;
}

export default function LeadToolbar({
  onCreateLead,
}: LeadToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <input
        type="text"
        placeholder="Search leads..."
        className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      />

      <button
        onClick={onCreateLead}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
      >
        + New Lead
      </button>
    </div>
  );
}