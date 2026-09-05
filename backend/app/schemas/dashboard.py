from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    # CRM Stats
    total_leads: int = 0
    companies: int = 0
    deals: int = 0
    tasks: int = 0

    # Detailed CRM Stats
    total_contacts: int = 0
    total_companies: int = 0
    total_deals: int = 0
    total_tasks: int = 0

    # Deal Stats
    open_deals: int = 0
    won_deals: int = 0
    lost_deals: int = 0

    # Task Stats
    todo_tasks: int = 0
    in_progress_tasks: int = 0
    completed_tasks: int = 0
    overdue_tasks: int = 0