from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    # CRM Stats
    total_leads: int
    total_contacts: int
    total_companies: int
    total_deals: int
    total_tasks: int

    # Deal Stats
    open_deals: int
    won_deals: int
    lost_deals: int

    # Task Stats
    todo_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    overdue_tasks: int