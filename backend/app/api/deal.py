from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import Query

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.deal import (
    DealCreate,
    DealResponse,
    DealUpdate,
    DealListResponse,
)
from backend.app.services.deal import (
    create_deal,
    get_deals,
    get_deal,
    update_deal,
    delete_deal,
)
from backend.app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/deals",
    tags=["Deals"],
)


@router.post(
    "/",
    response_model=DealResponse,
)
def create_new_deal(
    deal: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_deal(
        db,
        deal,
        current_user,
    )


@router.get(
    "/",
    response_model=DealListResponse,
)
def list_deals(
    search: str | None = Query(None),
    status: str | None = Query(None),
    pipeline_id: int | None = Query(None),
    owner_id: int | None = Query(None),
    company_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_deals(
        db=db,
        current_user=current_user,
        search=search,
        status=status,
        pipeline_id=pipeline_id,
        owner_id=owner_id,
        company_id=company_id,
        page=page,
        limit=limit,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/{deal_id}",
    response_model=DealResponse,
)
def get_single_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_deal(
        db,
        deal_id,
        current_user,
    )


@router.put(
    "/{deal_id}",
    response_model=DealResponse,
)
def edit_deal(
    deal_id: int,
    deal: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_deal(
        db,
        deal_id,
        deal,
        current_user,
    )


@router.delete(
    "/{deal_id}",
)
def remove_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_deal(
        db,
        deal_id,
        current_user,
    )