from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.company import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
)
from backend.app.services.company import (
    create_company,
    get_companies,
    update_company,
)
from backend.app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)


@router.post(
    "/",
    response_model=CompanyResponse,
)
def create_new_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_company(
        db,
        company,
        current_user,
    )


@router.get(
    "/",
    response_model=list[CompanyResponse],
)
def list_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_companies(
        db,
        current_user,
    )


@router.put(
    "/{company_id}",
    response_model=CompanyResponse,
)
def edit_company(
    company_id: int,
    company: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_company(
        db,
        company_id,
        company,
        current_user,
    )
