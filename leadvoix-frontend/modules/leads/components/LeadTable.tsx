"use client";

import { useLeads } from "../hooks/useLeads";

export default function LeadTable() {
  const {
    data: leads,
    isLoading,
    error,
  } = useLeads();

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

  if (!leads || leads.length === 0) {
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
          Total: {leads.length}
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

                <td className="px-6 py-4 text-center">
                  <button
                    className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}