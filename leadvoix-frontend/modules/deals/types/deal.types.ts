export interface Deal {
  id: number;
  title: string;
  amount: number | string;
  currency: string;
  status: string;
  expected_close_date: string | null;
  description: string | null;
  organization_id: number;
  pipeline_id: number | null;
  stage_id: number | null;
  lead_id: number | null;
  contact_id: number | null;
  company_id: number | null;
  owner_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface DealListResponse {
  items: Deal[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface DealPayload {
  title: string;
  amount: number;
  currency: string;
  status: string;
  expected_close_date?: string;
  description?: string;
  pipeline_id?: number;
  stage_id?: number;
  lead_id?: number;
  contact_id?: number;
  company_id?: number;
  owner_id?: number;
}

export interface DealFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  pipeline_id?: number;
  owner_id?: number;
  company_id?: number;
}