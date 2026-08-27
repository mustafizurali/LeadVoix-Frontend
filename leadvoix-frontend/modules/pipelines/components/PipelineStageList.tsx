"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { usePipelineStages } from "../hooks/usePipelineStages";
import type { Pipeline, PipelineStage } from "../types/pipeline.types";

import CreateStageModal from "./CreateStageModal";
import EditStageModal from "./EditStageModal";

interface PipelineStageListProps {
  pipeline: Pipeline;
}

export default function PipelineStageList({
  pipeline,
}: PipelineStageListProps) {
  const queryClient = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedStage, setSelectedStage] =
    useState<PipelineStage | null>(null);

  const {
    data: allStages = [],
    isLoading,
    error,
  } = usePipelineStages(pipeline.id);

  const stages = useMemo(() => {
    return allStages
      .filter(
        (stage: PipelineStage) =>
          stage.pipeline_id === pipeline.id
      )
      .sort(
        (a: PipelineStage, b: PipelineStage) =>
          a.position - b.position
      );
  }, [allStages, pipeline.id]);

  const handleOpenEdit = (
    stage: PipelineStage
  ) => {
    setSelectedStage(stage);
    setOpenEdit(true);
  };

  const refreshStages = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["pipeline-stages"],
    });
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Stages
          </h3>

          <p className="text-sm text-slate-500">
            Ordered by stage position
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + New Stage
        </button>

      </div>

      {isLoading ? (

        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading stages...
        </div>

      ) : error ? (

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load stages.
        </div>

      ) : stages.length === 0 ? (

        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          No stages found for this pipeline.
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="min-w-full text-left text-sm">

            <thead className="bg-white text-slate-600">

              <tr>

                <th className="px-3 py-2 font-semibold">
                  Name
                </th>

                <th className="px-3 py-2 font-semibold">
                  Position
                </th>

                <th className="px-3 py-2 font-semibold">
                  Color
                </th>

                <th className="px-3 py-2 font-semibold">
                  Type
                </th>

                <th className="px-3 py-2 font-semibold">
                  Probability
                </th>

                <th className="px-3 py-2 font-semibold">
                  SLA Days
                </th>

                <th className="px-3 py-2 font-semibold">
                  Status
                </th>

                <th className="px-3 py-2 text-center font-semibold">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {stages.map(
                (stage: PipelineStage) => (

                  <tr
                    key={stage.id}
                    className="border-t border-slate-200 bg-white"
                  >

                    <td className="px-3 py-3 font-medium text-slate-900">
                      {stage.name}
                    </td>

                    <td className="px-3 py-3 text-slate-700">
                      {stage.position}
                    </td>

                    <td className="px-3 py-3">

                      <div className="flex items-center gap-2">

                        <span
                          className="h-4 w-4 rounded-full border border-slate-300"
                          style={{
                            backgroundColor:
                              stage.color ?? "#64748b",
                          }}
                        />

                        <span className="text-slate-700">
                          {stage.color ?? "-"}
                        </span>

                      </div>

                    </td>

                    <td className="px-3 py-3">

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {stage.stage_type}
                      </span>

                    </td>

                    <td className="px-3 py-3 text-slate-700">
                      {stage.probability}%
                    </td>

                    <td className="px-3 py-3 text-slate-700">
                      {stage.sla_days}
                    </td>

                    <td className="px-3 py-3">

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          stage.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {stage.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td className="px-3 py-3">

                      <div className="flex justify-center">

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(stage)
                          }
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

      <CreateStageModal
        open={openCreate}
        onClose={async () => {
          setOpenCreate(false);
          await refreshStages();
        }}
        pipelineId={pipeline.id}
      />

      <EditStageModal
        open={openEdit}
        onClose={async () => {
          setOpenEdit(false);
          setSelectedStage(null);

          await refreshStages();
        }}
        stage={selectedStage}
      />

    </div>
  );
}