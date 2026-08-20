"use client";

import { Company } from "../types/company.types";
import { useCompanies } from "../hooks/useCompanies";

interface CompanyTableProps {
  search: string;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
}

export default function CompanyTable({
  search,
  onEditCompany,
  onDeleteCompany,
}: CompanyTableProps) {
  const {
    data,
    isLoading,
    error,
  } = useCompanies({
    search,
  });

  const companies = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        Loading companies...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-6 text-red-500 shadow-sm">
        Failed to load companies.
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        No companies found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          Companies
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
                Domain
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Industry
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Size
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Website
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                Status
              </th>

              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>
            {companies.map((company) => (
              <tr
                key={company.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="px-6 py-4 font-medium">
                  {company.name}
                </td>

                <td className="px-6 py-4">
                  {company.domain ?? "-"}
                </td>

                <td className="px-6 py-4">
                  {company.industry ?? "-"}
                </td>

                <td className="px-6 py-4">
                  {company.company_size ?? "-"}
                </td>

                <td className="px-6 py-4">
                  {company.website ?? "-"}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {company.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() => onEditCompany(company)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDeleteCompany(company)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
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
          Total Companies: {data?.total ?? 0}
        </p>

      </div>

    </div>
  );
}