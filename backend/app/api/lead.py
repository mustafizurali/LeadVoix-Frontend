from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.models.lead import Lead
from backend.app.schemas.lead import LeadCreate, LeadResponse, LeadUpdate

from backend.app.services.lead import (
    create_lead,
    delete_lead,
    get_leads,
    update_lead,
    get_lead_calls,
)

from backend.app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


# ============================================================
# CREATE LEAD
# ============================================================

@router.post(
    "/",
    response_model=LeadResponse,
)
def create_new_lead(
    lead: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_lead(
        db,
        lead,
        current_user,
    )


# ============================================================
# GET LEADS
# ============================================================

@router.get("/")
def read_leads(
    search: str | None = Query(None),
    status: str | None = Query(None),
    source: str | None = Query(None),
    company: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_leads(
        db=db,
        current_user=current_user,
        search=search,
        status=status,
        source=source,
        company=company,
        page=page,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


# ============================================================
# GET SINGLE LEAD
# ============================================================

@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
)
def read_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return lead


# ============================================================
# UPDATE LEAD
# ============================================================

@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
)
def edit_lead(
    lead_id: int,
    lead: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_lead(
        db=db,
        lead_id=lead_id,
        lead=lead,
        current_user=current_user,
    )


# ============================================================
# DELETE LEAD
# ============================================================

@router.delete("/{lead_id}")
def remove_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_lead(
        db=db,
        lead_id=lead_id,
        current_user=current_user,
    )


# ============================================================
# GET LEAD CALLS
# ============================================================

@router.get(
    "/{lead_id}/calls",
)
def read_lead_calls(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_lead_calls(
        db=db,
        lead_id=lead_id,
        current_user=current_user,
    )