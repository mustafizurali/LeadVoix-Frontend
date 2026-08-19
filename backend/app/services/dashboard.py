from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.models.lead import Lead
from backend.app.models.company import Company
from backend.app.models.deal import Deal
from backend.app.models.task import Task

from backend.app.schemas.dashboard import DashboardStatsResponse


def get_dashboard_stats(db: Session , current_user: User) -> DashboardStatsResponse:

    total_leads = db.query(Lead).filter(
        Lead.organization_id == current_user.organization_id).count()


    companies = db.query(Company).filter(
        Company.organization_id == current_user.organization_id).count()
    
    deals = db.query(Deal).filter(
        Deal.organization_id == current_user.organization_id).count()
    
    tasks = db.query(Task).filter(
        Task.organization_id == current_user.organization_id).count()

    return DashboardStatsResponse(
        total_leads=total_leads,
        companies=companies,
        deals=deals,
        tasks=tasks,
    )