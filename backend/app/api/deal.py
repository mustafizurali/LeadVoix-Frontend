from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.deal import (
    DealCreate,
    DealResponse,
    DealUpdate,
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
    response_model=list[DealResponse],
)
def list_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_deals(
        db,
        current_user,
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