"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import api from "@/lib/api/axios";

import { Lead } from "@/modules/leads/types/lead.types";
import { getLeadCalls } from "@/modules/leads/api/leadApi";

async function getLead(id: number): Promise<Lead> {
  const response = await api.get(`/leads/${id}`);
  return response.data;
}

export default function LeadDetailsPage() {
  const params = useParams();

  const leadId = Number(params.id);
  const {
    data: lead,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLead(leadId),
    enabled: !!leadId,
  });

  const {
    data: leadCalls,
    isLoading: isLoadingCalls,
    isError: isCallsError,
  } = useQuery({
    queryKey: ["lead-calls", leadId],
    queryFn: () => getLeadCalls(leadId),
    enabled: !!leadId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Loading lead...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !lead) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            Failed to load lead.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* PAGE HEADER */}
        <div>
          <p className="text-sm font-medium text-slate-500">
            Lead Details
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {lead.first_name} {lead.last_name ?? ""}
          </h1>

          <p className="mt-2 text-slate-500">
            View lead information, calls and AI intelligence.
          </p>
        </div>

        {/* LEAD INFORMATION */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Lead Information
            </h2>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Name */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Name
              </p>

              <p className="mt-2 font-medium text-slate-900">
                {lead.first_name} {lead.last_name ?? ""}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-2 font-medium text-slate-900">
                {lead.email ?? "—"}
              </p>
            </div>

            {/* Phone */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <p className="mt-2 font-medium text-slate-900">
                {lead.phone ?? "—"}
              </p>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Company
              </p>

              <p className="mt-2 font-medium text-slate-900">
                {lead.company ?? "—"}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </p>

              <div className="mt-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                  {lead.status}
                </span>
              </div>
            </div>

            {/* Source */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Source
              </p>

              <p className="mt-2 font-medium capitalize text-slate-900">
                {lead.source ?? "—"}
              </p>
            </div>

          </div>
        </section>

        {/* NOTES */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Notes
            </h2>
          </div>

          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {lead.notes ?? "No notes available."}
            </p>
          </div>
        </section>

        {/* AGENT CALLS */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Agent Calls
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Calls associated with this lead.
            </p>
          </div>

          <div className="p-6">
            <div className="p-6">
  {isLoadingCalls ? (
    <p className="text-sm text-slate-500">
      Loading agent calls...
    </p>
  ) : isCallsError ? (
    <p className="text-sm text-red-600">
      Failed to load agent calls.
    </p>
  ) : !leadCalls || leadCalls.length === 0 ? (
    <p className="text-sm text-slate-500">
      No agent calls found for this lead.
    </p>
  ) : (
    <div className="space-y-4">
      {leadCalls.map((call: any) => (
        <div
          key={call.id}
          className="rounded-xl border p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                {call.caller_name || "Unknown Caller"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {call.caller_phone || "No phone number"}
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize">
              {call.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">
                Call ID
              </p>
              <p className="mt-1 font-medium">
                #{call.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Direction
              </p>
              <p className="mt-1 font-medium capitalize">
                {call.direction}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Duration
              </p>
              <p className="mt-1 font-medium">
                {call.duration !== null
                  ? `${call.duration}s`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Created
              </p>
              <p className="mt-1 font-medium">
                {new Date(
                  call.created_at
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}