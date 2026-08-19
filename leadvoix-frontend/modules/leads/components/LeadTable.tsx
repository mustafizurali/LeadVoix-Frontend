"use client";

import { useLeads } from "../hooks/useLeads";
import { Lead } from "../types/lead.types";

interface LeadTableProps {
  search: string;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
}

export default function LeadTable({
  search,
  onEditLead,
  onDeleteLead,
}: LeadTableProps) {
  const {
    data,
    isLoading,
    error,
  } = useLeads({
    search,
  });

  const leads = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        Loading leads...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-6 text-red-500 shadow-sm">
        Failed to load leads.
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        No leads found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          Leads
        </h2>

        <span className="text-sm text-slate-500">
          Total: {data?.total ?? 0}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Name
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Email
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Phone
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Company
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Status
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Source
              </th>

              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium">
                    {lead.first_name} {lead.last_name ?? ""}
                  </div>
                </td>

                <td className="px-6 py-4">
                  {lead.email ?? "-"}
                </td>

                <td className="px-6 py-4">
                  {lead.phone ?? "-"}
                </td>

                <td className="px-6 py-4">
                  {lead.company ?? "-"}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {lead.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {lead.source ?? "-"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEditLead(lead)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDeleteLead(lead)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-sm text-slate-500">
          Page {data?.page ?? 1} of {data?.total_pages ?? 1}
        </p>

        <p className="text-sm text-slate-500">
          Total Leads: {data?.total ?? 0}
        </p>
      </div>
    </div>
  );
}