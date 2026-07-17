"use client";

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateLeadModal({
  open,
  onClose,
}: CreateLeadModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Create New Lead
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <p className="text-slate-500">
          Lead form will be added in the next step.
        </p>
      </div>
    </div>
  );
}