from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.company import Company
from backend.app.models.contact import Contact
from backend.app.models.deal import Deal
from backend.app.models.lead import Lead
from backend.app.models.pipeline import Pipeline
from backend.app.models.pipeline_stage import PipelineStage
from backend.app.models.user import User

from backend.app.schemas.deal import (
    DealCreate,
    DealUpdate,
)


def create_deal(
    db: Session,
    deal: DealCreate,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    # Validate Pipeline
    if deal.pipeline_id:
        pipeline = (
            db.query(Pipeline)
            .filter(
                Pipeline.id == deal.pipeline_id,
                Pipeline.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not pipeline:
            raise HTTPException(
                status_code=404,
                detail="Pipeline not found",
            )

    # Validate Stage
    if deal.stage_id:
        stage = (
            db.query(PipelineStage)
            .join(Pipeline)
            .filter(
                PipelineStage.id == deal.stage_id,
                Pipeline.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Pipeline stage not found",
            )

    # Validate Lead
    if deal.lead_id:
        lead = (
            db.query(Lead)
            .filter(
                Lead.id == deal.lead_id,
                Lead.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

    # Validate Contact
    if deal.contact_id:
        contact = (
            db.query(Contact)
            .filter(
                Contact.id == deal.contact_id,
                Contact.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not contact:
            raise HTTPException(
                status_code=404,
                detail="Contact not found",
            )

    # Validate Company
    if deal.company_id:
        company = (
            db.query(Company)
            .filter(
                Company.id == deal.company_id,
                Company.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

    # Validate Owner
    if deal.owner_id:
        owner = (
            db.query(User)
            .filter(
                User.id == deal.owner_id,
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not owner:
            raise HTTPException(
                status_code=404,
                detail="Owner not found",
            )

    db_deal = Deal(
        title=deal.title,
        amount=deal.amount,
        currency=deal.currency,
        status=deal.status,
        expected_close_date=deal.expected_close_date,
        description=deal.description,
        organization_id=current_user.organization_id,
        pipeline_id=deal.pipeline_id,
        stage_id=deal.stage_id,
        lead_id=deal.lead_id,
        contact_id=deal.contact_id,
        company_id=deal.company_id,
        owner_id=deal.owner_id,
    )

    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)

    return db_deal

def get_deals(
    db: Session,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    return (
        db.query(Deal)
        .filter(
            Deal.organization_id == current_user.organization_id,
        )
        .order_by(Deal.created_at.desc())
        .all()
    )


def get_deal(
    db: Session,
    deal_id: int,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    db_deal = (
        db.query(Deal)
        .filter(
            Deal.id == deal_id,
            Deal.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_deal:
        raise HTTPException(
            status_code=404,
            detail="Deal not found",
        )

    return db_deal
    
     
     
     
     
def update_deal(
    db: Session,
    deal_id: int,
    deal: DealUpdate,
    current_user: User,
    ):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    db_deal = (
        db.query(Deal)
        .filter(
            Deal.id == deal_id,
            Deal.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_deal:
        raise HTTPException(
            status_code=404,
            detail="Deal not found",
        )

    update_data = deal.model_dump(exclude_unset=True)

    # Validate Pipeline
    if (
        "pipeline_id" in update_data
        and update_data["pipeline_id"] is not None
    ):
        pipeline = (
            db.query(Pipeline)
            .filter(
                Pipeline.id == update_data["pipeline_id"],
                Pipeline.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not pipeline:
            raise HTTPException(
                status_code=404,
                detail="Pipeline not found",
            )

    # Validate Stage
    if (
        "stage_id" in update_data
        and update_data["stage_id"] is not None
    ):
        stage = (
            db.query(PipelineStage)
            .join(Pipeline)
            .filter(
                PipelineStage.id == update_data["stage_id"],
                Pipeline.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not stage:
            raise HTTPException(
                status_code=404,
                detail="Pipeline stage not found",
            )

    # Validate Lead
    if (
        "lead_id" in update_data
        and update_data["lead_id"] is not None
    ):
        lead = (
            db.query(Lead)
            .filter(
                Lead.id == update_data["lead_id"],
                Lead.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

    # Validate Contact
    if (
        "contact_id" in update_data
        and update_data["contact_id"] is not None
    ):
        contact = (
            db.query(Contact)
            .filter(
                Contact.id == update_data["contact_id"],
                Contact.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not contact:
            raise HTTPException(
                status_code=404,
                detail="Contact not found",
            )

    # Validate Company
    if (
        "company_id" in update_data
        and update_data["company_id"] is not None
    ):
        company = (
            db.query(Company)
            .filter(
                Company.id == update_data["company_id"],
                Company.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

    # Validate Owner
    if (
        "owner_id" in update_data
        and update_data["owner_id"] is not None
    ):
        owner = (
            db.query(User)
            .filter(
                User.id == update_data["owner_id"],
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not owner:
            raise HTTPException(
                status_code=404,
                detail="Owner not found",
            )

    for key, value in update_data.items():
        setattr(db_deal, key, value)

    db.commit()
    db.refresh(db_deal)

    return db_deal


def delete_deal(
    db: Session,
    deal_id: int,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    db_deal = (
        db.query(Deal)
        .filter(
            Deal.id == deal_id,
            Deal.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_deal:
        raise HTTPException(
            status_code=404,
            detail="Deal not found",
        )

    db.delete(db_deal)
    db.commit()

    return {
        "message": "Deal deleted successfully",
    }