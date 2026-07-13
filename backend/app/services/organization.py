from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.organization import Organization
from backend.app.models.user import User
from backend.app.schemas.organization import OrganizationCreate


def create_organization(
    db: Session,
    organization: OrganizationCreate,
    current_user: User,
):
    existing = db.query(Organization).filter(
        Organization.slug == organization.name.lower().replace(" ", "-")
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Organization already exists"
        )

    db_organization = Organization(
        name=organization.name,
        slug=organization.name.lower().replace(" ", "-"),
        plan="free"
    )

    db.add(db_organization)
    db.commit()
    db.refresh(db_organization)

    current_user.organization_id = db_organization.id
    current_user.role = "owner"

    db.commit()
    db.refresh(current_user)

    return db_organization