from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.lead import LeadCreate, LeadResponse, LeadUpdate
from backend.app.services.lead import create_lead, delete_lead, get_leads, update_lead
from backend.app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


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


@router.get(
    "/",
    response_model=list[LeadResponse],
)
def list_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_leads(
        db,
        current_user,
    )


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
        db,
        lead_id,
        lead,
        current_user,
    )
@router.delete("/{lead_id}")
def remove_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_lead(
        db,
        lead_id,
        current_user,
    )