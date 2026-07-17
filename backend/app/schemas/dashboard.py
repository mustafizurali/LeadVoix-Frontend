from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_leads: int
    companies: int
    deals: int
    tasks: int