from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.lead import Lead
from backend.app.models.user import User
from backend.app.schemas.lead import LeadCreate, LeadUpdate


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
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    return (
        db.query(Lead)
        .filter(
            Lead.organization_id == current_user.organization_id
        )
        .all()
    )


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