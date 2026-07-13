from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.company import Company
from backend.app.models.user import User
from backend.app.schemas.company import CompanyCreate, CompanyUpdate


def create_company(
    db: Session,
    company: CompanyCreate,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    db_company = Company(
        name=company.name,
        domain=company.domain,
        industry=company.industry,
        company_size=company.company_size,
        website=company.website,
        notes=company.notes,
        status="active",
        organization_id=current_user.organization_id,
    )

    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    return db_company


def get_companies(
    db: Session,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    return (
        db.query(Company)
        .filter(
            Company.organization_id == current_user.organization_id
        )
        .all()
    )


def update_company(
    db: Session,
    company_id: int,
    company: CompanyUpdate,
    current_user: User,
):
    db_company = (
        db.query(Company)
        .filter(
            Company.id == company_id,
            Company.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    update_data = company.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_company, key, value)

    db.commit()
    db.refresh(db_company)

    return db_company
