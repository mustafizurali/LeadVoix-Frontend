"use client";

import { useQuery } from "@tanstack/react-query";
import { getPipelines } from "../api/pipelineApi";

export const usePipelines = () => {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: getPipelines,
  });
};