from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.lead import Lead
from backend.app.models.user import User
from backend.app.models.agent_call import AgentCall
from backend.app.schemas.lead import LeadCreate, LeadUpdate
from sqlalchemy import or_


def create_lead(
    db: Session,
    lead: LeadCreate,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    db_lead = Lead(
        first_name=lead.first_name,
        last_name=lead.last_name,
        email=lead.email,
        phone=lead.phone,
        company=lead.company,
        source=lead.source or "manual",
        notes=lead.notes,
        status="new",
        organization_id=current_user.organization_id,
    )

    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)

    return db_lead


def get_leads(
    db: Session,
    current_user: User,
    search: str | None = None,
    status: str | None = None,
    source: str | None = None,
    company: str | None = None,
    page: int = 1,
    limit: int = 10,
    sort_by: str = "created_at",
    order: str = "desc",
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    query = (
        db.query(Lead)
        .filter(
            Lead.organization_id == current_user.organization_id
        )
    )

    # Search
    if search:
        search = f"%{search}%"
        query = query.filter(
            or_(
                Lead.first_name.ilike(search),
                Lead.last_name.ilike(search),
                Lead.email.ilike(search),
                Lead.phone.ilike(search),
                Lead.company.ilike(search),
            )
        )

    # Filters
    if status:
        query = query.filter(
            Lead.status == status
        )

    if source:
        query = query.filter(
            Lead.source == source
        )

    if company:
        query = query.filter(
            Lead.company.ilike(f"%{company}%")
        )

    allowed_sort_fields = {
        "id": Lead.id,
        "first_name": Lead.first_name,
        "last_name": Lead.last_name,
        "email": Lead.email,
        "company": Lead.company,
        "status": Lead.status,
        "source": Lead.source,
        "created_at": Lead.created_at,
        "updated_at": Lead.updated_at,
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Lead.created_at,
    )

    if order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()

    leads = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": leads,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


def update_lead(
    db: Session,
    lead_id: int,
    lead: LeadUpdate,
    current_user: User,
):
    db_lead = (
        db.query(Lead)
        .filter(
            Lead.id == lead_id,
            Lead.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    update_data = lead.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_lead, key, value)

    db.commit()
    db.refresh(db_lead)

    return db_lead

def delete_lead(
    db: Session,
    lead_id: int,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    db_lead = (
        db.query(Lead)
        .filter(
            Lead.id == lead_id,
            Lead.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found",
        )

    db.delete(db_lead)
    db.commit()

    return {
        "message": "Lead deleted successfully"
    }

def get_lead_calls(
    db: Session,
    lead_id: int,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    # Get lead belonging to current user's organization
    lead = (
        db.query(Lead)
        .filter(
            Lead.id == lead_id,
            Lead.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found",
        )

    if not lead.phone:
        return []

    def normalize_phone(phone: str | None) -> str:
        if not phone:
            return ""

        return "".join(
            char for char in phone
            if char.isdigit()
        )

    lead_phone = normalize_phone(lead.phone)

    calls = (
        db.query(AgentCall)
        .filter(
            AgentCall.organization_id
            == current_user.organization_id
        )
        .order_by(AgentCall.created_at.desc())
        .all()
    )

    matched_calls = []

    for call in calls:
        call_phone = normalize_phone(
            call.caller_phone
        )

        if not call_phone:
            continue

        # Exact normalized phone match
        if call_phone == lead_phone:
            matched_calls.append(call)
            continue

        # Fallback for country-code differences
        if (
            len(lead_phone) >= 10
            and len(call_phone) >= 10
            and lead_phone[-10:] == call_phone[-10:]
        ):
            matched_calls.append(call)

    return matched_calls