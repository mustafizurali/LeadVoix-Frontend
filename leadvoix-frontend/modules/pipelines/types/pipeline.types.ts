export type PipelineStageType = "NORMAL" | "OPEN" | "WON" | "LOST";


export interface Pipeline {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  is_default: boolean;
  is_active: boolean;
  organization_id: number;
  created_at: string;
  updated_at: string;
}


export interface CreatePipelinePayload {
  name: string;
  description?: string;
  color?: string;
  is_default?: boolean;
  is_active?: boolean;
}


export interface UpdatePipelinePayload {
  name?: string;
  description?: string;
  color?: string;
  is_default?: boolean;
  is_active?: boolean;
}


export interface PipelineStage {
  id: number;
  pipeline_id: number;
  name: string;
  position: number;
  color: string | null;
  stage_type: PipelineStageType;
  probability: number;
  sla_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


export interface CreateStagePayload {
  pipeline_id: number;
  name: string;
  position: number;
  color?: string;
  stage_type: PipelineStageType;
  probability: number;
  sla_days: number;
  is_active?: boolean;
}


export interface UpdateStagePayload {
  pipeline_id?: number;
  name?: string;
  position?: number;
  color?: string;
  stage_type?: PipelineStageType;
  probability?: number;
  sla_days?: number;
  is_active?: boolean;
}

export interface PipelineListResponse {
  items: Pipeline[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}