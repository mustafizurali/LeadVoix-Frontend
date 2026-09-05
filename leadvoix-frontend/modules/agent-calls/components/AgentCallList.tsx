"use client";

import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  analyzeAgentCall,
  getAgentCallIntelligence,
  getAgentCalls,
} from "../api/agentCallApi";

import {
  AgentCall,
  AgentCallIntelligence,
} from "../types/agentCall.types";

interface AgentCallListProps {
  agentId: number;
}

export default function AgentCallList({
  agentId,
}: AgentCallListProps) {
  const [selectedCall, setSelectedCall] =
    useState<AgentCall | null>(null);

  const [intelligence, setIntelligence] =
    useState<AgentCallIntelligence | null>(null);

  /*
   * ============================================================
   * GET AGENT CALLS
   * ============================================================
   */

  const {
    data: calls,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["agent-calls", agentId],
    queryFn: () => getAgentCalls(agentId),
    enabled: !!agentId,
  });

  /*
   * ============================================================
   * GET EXISTING AI INTELLIGENCE
   * ============================================================
   */

  const {
    data: existingIntelligence,
    isLoading: isLoadingIntelligence,
    isError: isIntelligenceError,
  } = useQuery({
    queryKey: [
      "agent-call-intelligence",
      agentId,
      selectedCall?.id,
    ],
    queryFn: () =>
      getAgentCallIntelligence(
        agentId,
        selectedCall!.id
      ),
    enabled: !!selectedCall,
    retry: false,
  });

  /*
   * ============================================================
   * SYNC EXISTING INTELLIGENCE INTO LOCAL STATE
   * ============================================================
   */

  useEffect(() => {
    if (existingIntelligence) {
      setIntelligence(existingIntelligence);
    }
  }, [existingIntelligence]);

  /*
   * ============================================================
   * ANALYZE CALL
   * ============================================================
   */

  const analyzeMutation = useMutation({
    mutationFn: (callId: number) =>
      analyzeAgentCall(agentId, callId),

    onSuccess: (data) => {
      setIntelligence(data);
    },

    onError: (error) => {
      console.error(
        "Call intelligence analysis failed:",
        error
      );
    },
  });

  /*
   * ============================================================
   * VIEW DETAILS
   * ============================================================
   */

  const handleViewDetails = (call: AgentCall) => {
    setSelectedCall(call);
    setIntelligence(null);

    analyzeMutation.reset();
  };

  /*
   * ============================================================
   * ANALYZE SELECTED CALL
   * ============================================================
   */

  const handleAnalyzeCall = () => {
    if (!selectedCall) return;

    analyzeMutation.mutate(selectedCall.id);
  };

  /*
   * ============================================================
   * CLOSE MODAL
   * ============================================================
   */

  const closeDetails = () => {
    setSelectedCall(null);
    setIntelligence(null);

    analyzeMutation.reset();
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading calls...
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">
          Failed to load calls.
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (!calls || calls.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          No calls found.
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */

  return (
    <>
      {/* ========================================================
          CALL LIST
      ========================================================= */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* HEADER */}

        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Agent Calls
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Call history for this agent.
          </p>
        </div>

        {/* CALLS */}

        <div className="divide-y">
          {calls.map((call) => (
            <div
              key={call.id}
              className="px-6 py-5 transition hover:bg-slate-50"
            >
              {/* CALL HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {call.caller_name ||
                      "Unknown Caller"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {call.caller_phone ||
                      "No phone number"}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                  {call.status}
                </span>
              </div>

              {/* CALL INFORMATION */}

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
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

              {/* ACTIONS */}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleViewDetails(call)
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  View Details
                </button>

                {call.recording_url && (
                  <a
                    href={call.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Listen to Recording
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          CALL DETAILS MODAL
      ========================================================= */}

      {selectedCall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Call #{selectedCall.id}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCall.caller_name ||
                    "Unknown Caller"}{" "}
                  ·{" "}
                  {selectedCall.caller_phone ||
                    "No phone number"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            {/* ==================================================
                MODAL CONTENT
            ================================================== */}

            <div className="space-y-6 p-6">
              {/* =================================================
                  CALL INFORMATION
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Call Information
                </h3>

                <div className="grid grid-cols-2 gap-4 rounded-xl border bg-slate-50 p-5 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Status
                    </p>

                    <p className="mt-1 font-medium capitalize text-slate-900">
                      {selectedCall.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Direction
                    </p>

                    <p className="mt-1 font-medium capitalize text-slate-900">
                      {selectedCall.direction}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Duration
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      {selectedCall.duration !==
                      null
                        ? `${selectedCall.duration}s`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Call ID
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      #{selectedCall.id}
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  TRANSCRIPT
              ================================================== */}

              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Transcript
                </h3>

                <div className="rounded-xl border bg-slate-50 p-5">
                  {selectedCall.transcript ? (
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {selectedCall.transcript}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No transcript is available for
                      this call.
                    </p>
                  )}
                </div>
              </section>

              {/* =================================================
                  RECORDING
              ================================================== */}

              {selectedCall.recording_url && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Recording
                  </h3>

                  <div className="rounded-xl border bg-slate-50 p-5">
                    <audio
                      controls
                      className="w-full"
                      src={selectedCall.recording_url}
                    >
                      Your browser does not support
                      audio playback.
                    </audio>
                  </div>
                </section>
              )}

              {/* =================================================
                  AI CALL INTELLIGENCE
              ================================================== */}

              <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      AI Call Intelligence
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Analyze this call using LeadVoix
                      AI.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeCall}
                    disabled={
                      analyzeMutation.isPending ||
                      isLoadingIntelligence
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {analyzeMutation.isPending
                      ? "Analyzing..."
                      : "Analyze Call"}
                  </button>
                </div>

                {/* EXISTING INTELLIGENCE LOADING */}

                {isLoadingIntelligence && (
                  <div className="mt-4 rounded-lg border bg-white p-4">
                    <p className="text-sm text-slate-500">
                      Loading existing AI analysis...
                    </p>
                  </div>
                )}

                {/* INTELLIGENCE GET ERROR */}

                {isIntelligenceError &&
                  !isLoadingIntelligence && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm text-amber-700">
                        No existing AI analysis found.
                        You can analyze this call now.
                      </p>
                    </div>
                  )}

                {/* ANALYSIS ERROR */}

                {analyzeMutation.isError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-600">
                      Failed to analyze this call.
                      Please try again.
                    </p>
                  </div>
                )}
              </section>

              {/* =================================================
                  AI INTELLIGENCE RESULT
              ================================================== */}

              {intelligence && (
                <section>
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      AI Intelligence
                    </h3>

                    <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Analysis Complete
                    </span>
                  </div>

                  {/* TOP METRICS */}

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* SENTIMENT */}

                    <div className="rounded-xl border bg-white p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Sentiment
                      </p>

                      <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                        {intelligence.sentiment ||
                          "—"}
                      </p>
                    </div>

                    {/* LEAD SCORE */}

                    <div className="rounded-xl border bg-white p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Lead Score
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {intelligence.lead_score}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        out of 100
                      </p>
                    </div>

                    {/* LEAD TEMPERATURE */}

                    <div className="rounded-xl border bg-white p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Lead Temperature
                      </p>

                      <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                        {intelligence.lead_temperature ||
                          "—"}
                      </p>
                    </div>

                    {/* CUSTOMER INTENT */}

                    <div className="rounded-xl border bg-white p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Customer Intent
                      </p>

                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {intelligence.customer_intent ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  {/* OBJECTIONS */}

                  <div className="mt-4 rounded-xl border bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Objections
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {intelligence.objections ||
                        "No objections detected."}
                    </p>
                  </div>

                  {/* BUYING SIGNALS */}

                  <div className="mt-4 rounded-xl border bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Buying Signals
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {intelligence.buying_signals ||
                        "No buying signals detected."}
                    </p>
                  </div>

                  {/* RECOMMENDED ACTION */}

                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Recommended Action
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                      {intelligence.recommended_action ||
                        "No recommendation available."}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* ==================================================
                MODAL FOOTER
            ================================================== */}

            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}