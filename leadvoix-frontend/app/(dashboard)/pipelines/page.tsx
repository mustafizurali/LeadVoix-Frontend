"use client";

import { useState } from "react";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import CreatePipelineModal from "@/modules/pipelines/components/CreatePipelineModal";
import EditPipelineModal from "@/modules/pipelines/components/EditPipelineModal";
import PipelineTable from "@/modules/pipelines/components/PipelineTable";
import PipelineToolbar from "@/modules/pipelines/components/PipelineToolbar";
import type { Pipeline } from "@/modules/pipelines/types/pipeline.types";

export default function PipelinesPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  const handleEditPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedPipeline(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pipelines</h1>
          <p className="mt-2 text-slate-500">Manage your sales pipelines and stages.</p>
        </div>

        <PipelineToolbar
          search={search}
          onSearchChange={setSearch}
          onCreatePipeline={() => setOpenCreate(true)}
        />

        <PipelineTable
          search={search}
          onEditPipeline={handleEditPipeline}
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
