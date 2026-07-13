from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.contact import (
    ContactCreate,
    ContactResponse,
    ContactUpdate,
)
from backend.app.services.contact import (
    create_contact,
    get_contacts,
    update_contact,
)
from backend.app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/contacts",
    tags=["Contacts"],
)


@router.post(
    "/",
    response_model=ContactResponse,
)
def create_new_contact(
    contact: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_contact(
        db,
        contact,
        current_user,
    )


@router.get(
    "/",
    response_model=list[ContactResponse],
)
def list_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_contacts(
        db,
        current_user,
    )


@router.put(
    "/{contact_id}",
    response_model=ContactResponse,
)
def edit_contact(
    contact_id: int,
    contact: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_contact(
        db,
        contact_id,
        contact,
        current_user,
    )