export interface Task {
  id: number;

  title: string;
  description: string | null;

  priority: string;
  status: string;

  due_date: string | null;

  organization_id: number;

  deal_id: number | null;
  lead_id: number | null;
  contact_id: number | null;
  company_id: number | null;

  assigned_to: number | null;
  created_by: number;

  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface TaskPayload {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date?: string;

  deal_id?: number;
  lead_id?: number;
  contact_id?: number;
  company_id?: number;

  assigned_to?: number;
}

export interface TaskFilters {
  page: number;
  limit: number;

  search?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  company_id?: number;

  sort_by?: string;
  order?: string;
}