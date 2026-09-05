export interface DashboardStats {
  // CRM Stats
  total_leads: number;
  total_contacts: number;
  total_companies: number;
  total_deals: number;
  total_tasks: number;

  // Backward-compatible fields
  companies: number;
  deals: number;
  tasks: number;

  // Deal Stats
  open_deals: number;
  won_deals: number;
  lost_deals: number;

  // Task Stats
  todo_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
}