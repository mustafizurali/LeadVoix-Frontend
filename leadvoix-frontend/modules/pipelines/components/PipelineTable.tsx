"use client";

import { Fragment, useState } from "react";

import { usePipelines } from "../hooks/usePipelines";
import type { Pipeline } from "../types/pipeline.types";
import PipelineStageList from "./PipelineStageList";

interface PipelineTableProps {
  search: string;
  onEditPipeline: (pipeline: Pipeline) => void;
}

export default function PipelineTable({
  search,
  onEditPipeline,
}: PipelineTableProps) {
  const [expandedPipelineId, setExpandedPipelineId] = useState<number | null>(
    null
  );

  const { data, isLoading, error } = usePipelines();



    const pipelines: Pipeline[] = data?.items ?? [];

    const normalizedSearch = search.trim().toLowerCase();



  const filteredPipelines = pipelines.filter((pipeline) => {
    if (!normalizedSearch) {
      return true;
    }

    return [pipeline.name, pipeline.description, pipeline.color]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  const togglePipeline = (pipelineId: number) => {
    setExpandedPipelineId((current) =>
      current === pipelineId ? null : pipelineId
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Loading pipelines...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
        Failed to load pipelines.
      </div>
    );
  }

  if (filteredPipelines.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
        No pipelines found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Pipelines
        </h2>

        <span className="text-sm text-slate-500">
          Total: {filteredPipelines.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">
                Name
              </th>

              <th className="px-6 py-3 text-sm font-semibold text-slate-600">
                Description
              </th>

              <th className="px-6 py-3 text-sm font-semibold text-slate-600">
                Color
              </th>

              <th className="px-6 py-3 text-sm font-semibold text-slate-600">
                Default
              </th>

              <th className="px-6 py-3 text-sm font-semibold text-slate-600">
                Status
              </th>

              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredPipelines.map((pipeline) => {
              const isExpanded = expandedPipelineId === pipeline.id;

              return (
                <Fragment key={pipeline.id}>
                  <tr className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => togglePipeline(pipeline.id)}
                        className="text-left font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {pipeline.name}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {pipeline.description || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-300"
                          style={{
                            backgroundColor:
                              pipeline.color ?? "#3b82f6",
                          }}
                        />

                        <span className="text-slate-600">
                          {pipeline.color ?? "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          pipeline.is_default
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {pipeline.is_default ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          pipeline.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {pipeline.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => onEditPipeline(pipeline)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={6}
                        className="bg-slate-50 px-4 py-4"
                      >
                        <PipelineStageList pipeline={pipeline} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
        <p>Showing {filteredPipelines.length} pipeline(s)</p>

        <p>Total Pipelines: {pipelines.length}</p>
      </div>
    </div>
  );
}