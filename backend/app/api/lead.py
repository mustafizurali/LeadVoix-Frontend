from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.lead import LeadCreate, LeadResponse, LeadUpdate
from backend.app.services.lead import create_lead, delete_lead, get_leads, update_lead
from backend.app.utils.dependencies import get_current_user
from fastapi import Query

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
