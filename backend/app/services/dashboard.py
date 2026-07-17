from sqlalchemy.orm import Session

from backend.app.models.lead import Lead
from backend.app.models.company import Company
from backend.app.models.deal import Deal
from backend.app.models.task import Task

from backend.app.schemas.dashboard import DashboardStatsResponse


def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
    total_leads = db.query(Lead).count()
    companies = db.query(Company).count()
    deals = db.query(Deal).count()
    tasks = db.query(Task).count()

    return DashboardStatsResponse(
        total_leads=total_leads,
        companies=companies,
        deals=deals,
        tasks=tasks,
    )