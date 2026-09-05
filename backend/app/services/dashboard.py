from datetime import date

from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.models.lead import Lead
from backend.app.models.contact import Contact
from backend.app.models.company import Company
from backend.app.models.deal import Deal
from backend.app.models.task import Task

from backend.app.schemas.dashboard import DashboardStatsResponse


def get_dashboard_stats(
    db: Session,
    current_user: User,
) -> DashboardStatsResponse:

    if current_user.organization_id is None:
        raise ValueError(
            "User is not assigned to any organization"
        )

    organization_id = current_user.organization_id

    # ================================
    # CRM COUNTS
    # ================================

    total_leads = (
        db.query(Lead)
        .filter(
            Lead.organization_id == organization_id
        )
        .count()
    )

    total_contacts = (
        db.query(Contact)
        .filter(
            Contact.organization_id == organization_id
        )
        .count()
    )

    total_companies = (
        db.query(Company)
        .filter(
            Company.organization_id == organization_id
        )
        .count()
    )

    total_deals = (
        db.query(Deal)
        .filter(
            Deal.organization_id == organization_id
        )
        .count()
    )

    total_tasks = (
        db.query(Task)
        .filter(
            Task.organization_id == organization_id
        )
        .count()
    )

    # ================================
    # DEAL STATS
    # ================================

    open_deals = (
        db.query(Deal)
        .filter(
            Deal.organization_id == organization_id,
            Deal.status == "OPEN",
        )
        .count()
    )

    won_deals = (
        db.query(Deal)
        .filter(
            Deal.organization_id == organization_id,
            Deal.status == "WON",
        )
        .count()
    )

    lost_deals = (
        db.query(Deal)
        .filter(
            Deal.organization_id == organization_id,
            Deal.status == "LOST",
        )
        .count()
    )

    # ================================
    # TASK STATS
    # ================================

    todo_tasks = (
        db.query(Task)
        .filter(
            Task.organization_id == organization_id,
            Task.status == "TODO",
        )
        .count()
    )

    in_progress_tasks = (
        db.query(Task)
        .filter(
            Task.organization_id == organization_id,
            Task.status == "IN_PROGRESS",
        )
        .count()
    )

    completed_tasks = (
        db.query(Task)
        .filter(
            Task.organization_id == organization_id,
            Task.status == "DONE",
        )
        .count()
    )

    overdue_tasks = (
        db.query(Task)
        .filter(
            Task.organization_id == organization_id,
            Task.due_date < date.today(),
            Task.status != "DONE",
        )
        .count()
    )

    # ================================
    # RESPONSE
    # ================================

    return DashboardStatsResponse(
        total_leads=total_leads,
        total_contacts=total_contacts,
        total_companies=total_companies,
        total_deals=total_deals,
        total_tasks=total_tasks,

        open_deals=open_deals,
        won_deals=won_deals,
        lost_deals=lost_deals,

        todo_tasks=todo_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        overdue_tasks=overdue_tasks,
    )