"use client";
export default function RecentLeads() {
  const leads = [
    {
      id: 1,
      name: "John Doe",
      company: "Tesla",
      status: "New",
      created: "Today",
    },
    {
      id: 2,
      name: "Sarah Smith",
      company: "Google",
      status: "Qualified",
      created: "Yesterday",
    },
    {
      id: 3,
      name: "Alex Johnson",
      company: "Amazon",
      status: "Proposal",
      created: "2 days ago",
    },
  ];

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">
          Recent Leads
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Company</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="px-6 py-4">{lead.name}</td>

                <td className="px-6 py-4">
                  {lead.company}
                </td>

                <td className="px-6 py-4">
                  {lead.status}
                </td>

                <td className="px-6 py-4">
                  {lead.created}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}