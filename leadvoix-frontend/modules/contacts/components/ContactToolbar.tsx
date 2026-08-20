"use client";

interface ContactToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateContact: () => void;
}

export default function ContactToolbar({
  search,
  onSearchChange,
  onCreateContact,
}: ContactToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <input
        type="text"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      />

      <button
        onClick={onCreateContact}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
      >
        + New Contact
      </button>
    </div>
  );
}