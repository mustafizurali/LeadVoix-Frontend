"use client";

import { useQuery } from "@tanstack/react-query";

import { getPipelineStages } from "../api/pipelineApi";

export const usePipelineStages = (pipelineId: number) => {
  return useQuery({
    queryKey: ["pipeline-stages", pipelineId],
    queryFn: () => getPipelineStages(pipelineId),
    enabled: Boolean(pipelineId),
  });
};