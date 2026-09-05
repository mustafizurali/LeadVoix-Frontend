"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import CreatePipelineModal from "@/modules/pipelines/components/CreatePipelineModal";
import EditPipelineModal from "@/modules/pipelines/components/EditPipelineModal";
import PipelineTable from "@/modules/pipelines/components/PipelineTable";
import PipelineToolbar from "@/modules/pipelines/components/PipelineToolbar";
import { deletePipeline } from "@/modules/pipelines/api/pipelineApi";
import type { Pipeline } from "@/modules/pipelines/types/pipeline.types";

export default function PipelinesPage() {
  const queryClient = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedPipeline, setSelectedPipeline] =
    useState<Pipeline | null>(null);

  const handleEditPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedPipeline(null);
  };

  const handleDeletePipeline = async (pipeline: Pipeline) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${pipeline.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePipeline(pipeline.id);

      await queryClient.invalidateQueries({
        queryKey: ["pipelines"],
      });
    } catch (error) {
      console.error("Failed to delete pipeline:", error);

      alert("Failed to delete pipeline");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pipelines
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your sales pipelines and stages.
          </p>
        </div>

        <PipelineToolbar
          search={search}
          onSearchChange={setSearch}
          onCreatePipeline={() => setOpenCreate(true)}
        />

        <PipelineTable
          search={search}
          onEditPipeline={handleEditPipeline}
          onDeletePipeline={handleDeletePipeline}
        />
      </div>

      <CreatePipelineModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />

      <EditPipelineModal
        open={openEdit}
        onClose={handleCloseEdit}
        pipeline={selectedPipeline}
      />
    </DashboardLayout>
  );
}