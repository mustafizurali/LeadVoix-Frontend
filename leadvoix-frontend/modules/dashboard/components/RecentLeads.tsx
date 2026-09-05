"use client";

import { useLeads } from "@/modules/leads/hooks/useLeads";

export default function RecentLeads() {
  const {
    data,
    isLoading,
    isError,
  } = useLeads({
    page: 1,
    limit: 3,
    sort_by: "created_at",
    order: "desc",
  });

  const leads = data?.items ?? [];

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">
          Recent Leads
        </h2>
      </div>

      {isLoading && (
        <div className="p-6 text-slate-500">
          Loading recent leads...
        </div>
      )}

      {isError && (
        <div className="p-6 text-red-600">
          Failed to load recent leads.
        </div>
      )}

      {!isLoading && !isError && leads.length === 0 && (
        <div className="p-6 text-slate-500">
          No leads found.
        </div>
      )}

      {!isLoading && !isError && leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  Name
                </th>

                <th className="px-6 py-3 text-left">
                  Company
                </th>

                <th className="px-6 py-3 text-left">
                  Status
                </th>

                <th className="px-6 py-3 text-left">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => {
                const fullName = [
                  lead.first_name,
                  lead.last_name,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <tr
                    key={lead.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      {fullName || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {lead.company || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {lead.status || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {formatCreatedDate(
                        lead.created_at
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}