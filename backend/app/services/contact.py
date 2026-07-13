from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.contact import Contact
from backend.app.models.user import User
from backend.app.schemas.contact import ContactCreate, ContactUpdate


def create_contact(
    db: Session,
    contact: ContactCreate,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    db_contact = Contact(
        first_name=contact.first_name,
        last_name=contact.last_name,
        email=contact.email,
        phone=contact.phone,
        company=contact.company,
        status="new",
        organization_id=current_user.organization_id,
    )

    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    return db_contact


def get_contacts(
    db: Session,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    return (
        db.query(Contact)
        .filter(
            Contact.organization_id == current_user.organization_id
        )
        .all()
    )

def update_contact(
    db: Session,
    contact_id: int,
    contact: ContactUpdate,
    current_user: User,
):
    db_contact = (
        db.query(Contact)
        .filter(
            Contact.id == contact_id,
            Contact.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_contact:
        raise HTTPException(
            status_code=404,
            detail="Contact not found"
        )

    update_data = contact.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_contact, key, value)

    db.commit()
    db.refresh(db_contact)

    return db_contact
