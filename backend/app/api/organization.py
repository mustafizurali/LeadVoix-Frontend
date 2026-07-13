from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
)
from backend.app.services.organization import create_organization
from backend.app.utils.dependencies import get_current_user
from backend.app.models.user import User

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


@router.post(
    "/",
    response_model=OrganizationResponse,
)
def create_company(
    organization: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_organization(
        db,
        organization,
        current_user,
    )