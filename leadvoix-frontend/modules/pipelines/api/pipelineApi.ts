import api from "@/lib/api/axios";

import type {
  CreatePipelinePayload,
  CreateStagePayload,
  Pipeline,
  PipelineListResponse,
  PipelineStage,
  UpdatePipelinePayload,
  UpdateStagePayload,
} from "../types/pipeline.types";

/* ================================
   PIPELINES
================================ */

export const getPipelines = async (): Promise<PipelineListResponse> => {
  const response = await api.get("/pipelines/");

  return response.data as PipelineListResponse;
};

export const createPipeline = async (
  data: CreatePipelinePayload
): Promise<Pipeline> => {
  const response = await api.post("/pipelines/", data);

  return response.data as Pipeline;
};

export const updatePipeline = async (
  pipelineId: number,
  data: UpdatePipelinePayload
): Promise<Pipeline> => {
  const response = await api.put(
    `/pipelines/${pipelineId}`,
    data
  );

  return response.data as Pipeline;
};

/* ================================
   PIPELINE STAGES
================================ */

export const getPipelineStages = async (
  pipelineId: number
): Promise<PipelineStage[]> => {
  const response = await api.get(
    `/pipelines/${pipelineId}/stages`
  );

  return response.data.items as PipelineStage[];
};

export const createPipelineStage = async (
  pipelineId: number,
  data: CreateStagePayload
): Promise<PipelineStage> => {
  const response = await api.post(
    `/pipelines/${pipelineId}/stages`,
    data
  );

  return response.data as PipelineStage;
};

export const updatePipelineStage = async (
  stageId: number,
  data: UpdateStagePayload
): Promise<PipelineStage> => {
  const response = await api.put(
    `/pipelines/stages/${stageId}`,
    data
  );

  return response.data as PipelineStage;
};

export const deletePipeline = async (
  id: number
): Promise<void> => {
  await api.delete(`/pipelines/${id}`);
};