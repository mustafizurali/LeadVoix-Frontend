"use client";

import { Deal } from "../types/deal.types";

interface DealTableProps {
  deals: Deal[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}

export default function DealTable({
  deals,
  isLoading,
  isError,
  onEdit,
  onDelete,
}: DealTableProps) {
  if (isLoading) {
    return <div>Loading deals...</div>;
  }

  if (isError) {
    return <div>Failed to load deals.</div>;
  }

  if (!deals || deals.length === 0) {
    return <div>No deals found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Currency</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Pipeline</th>
            <th className="p-3 text-left">Stage</th>
            <th className="p-3 text-left">Expected Close</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {deals.map((deal) => (
            <tr
              key={deal.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-3">{deal.title}</td>

              <td className="p-3">
                {Number(deal.amount).toFixed(2)}
              </td>

              <td className="p-3">
                {deal.currency}
              </td>

              <td className="p-3">
                {deal.status}
              </td>

              <td className="p-3">
                {deal.pipeline_id ?? "-"}
              </td>

              <td className="p-3">
                {deal.stage_id ?? "-"}
              </td>

              <td className="p-3">
                {deal.expected_close_date ?? "-"}
              </td>

              <td className="p-3">
                <button
                  type="button"
                  onClick={() => onEdit(deal)}
                  className="mr-2 rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(deal)}
                  className="rounded bg-red-600 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}