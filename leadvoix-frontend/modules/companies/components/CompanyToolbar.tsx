"use client";

interface CompanyToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateCompany: () => void;
}

export default function CompanyToolbar({
  search,
  onSearchChange,
  onCreateCompany,
}: CompanyToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <input
        type="text"
        placeholder="Search companies..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={onCreateCompany}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
      >
        + New Company
      </button>
    </div>
  );
}
