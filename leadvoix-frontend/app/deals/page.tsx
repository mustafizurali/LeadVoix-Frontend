"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import DealTable from "@/modules/deals/components/DealTable";
import DealForm from "@/modules/deals/components/DealForm";
import { deleteDeal } from "@/modules/deals/api/dealApi";
import { useDeals } from "@/modules/deals/hooks/useDeals";
import { Deal } from "@/modules/deals/types/deal.types";
import { usePipelines } from "@/modules/pipelines/hooks/usePipelines";

export default function DealsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pipelineId, setPipelineId] = useState("");
  const [page, setPage] = useState(1);
  const { data: pipelinesData } = usePipelines();
  const filters = {
    page,
    limit: 10,
    search,
    status,
    pipeline_id: pipelineId ? Number(pipelineId) : undefined,
  };
  const { data, isLoading, isError } = useDeals(filters);

  const handleDealSuccess = () => {
    setShowForm(false);
    setSelectedDeal(null);
    void queryClient.invalidateQueries({ queryKey: ["deals"] });
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
  };

  const handleDelete = async (deal: Deal) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${deal.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteDeal(deal.id);
      await queryClient.invalidateQueries({ queryKey: ["deals"] });
    } catch (error) {
      console.error(error);
      window.alert("Failed to delete deal. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Deals</h1>
            <p className="mt-2 text-slate-500">Manage all your deals.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDeal(null);
              setShowForm((current) => !current);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Create Deal"}
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search deals..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={pipelineId}
            onChange={(event) => {
              setPipelineId(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Pipelines</option>
            {pipelinesData?.items.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              {selectedDeal ? "Edit Deal" : "Create Deal"}
            </h2>
            <DealForm
              key={selectedDeal?.id ?? "create"}
              deal={selectedDeal}
              onSuccess={handleDealSuccess}
            />
          </div>
        )}

        <DealTable
          deals={data?.items || []}
          isLoading={isLoading}
          isError={isError}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {page} of {data?.total_pages ?? 1}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= (data?.total_pages ?? 1)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}