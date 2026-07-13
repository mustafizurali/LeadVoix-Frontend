from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.db.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(
        String,
        nullable=False,
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    currency = Column(
        String,
        nullable=False,
        default="USD",
    )

    status = Column(
        String,
        nullable=False,
        default="OPEN",
    )

    expected_close_date = Column(
        Date,
        nullable=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
    )

    pipeline_id = Column(
        Integer,
        ForeignKey("pipelines.id"),
        nullable=True,
    )

    stage_id = Column(
        Integer,
        ForeignKey("pipeline_stages.id"),
        nullable=True,
    )

    lead_id = Column(
        Integer,
        ForeignKey("leads.id"),
        nullable=True,
    )

    contact_id = Column(
        Integer,
        ForeignKey("contacts.id"),
        nullable=True,
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=True,
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    organization = relationship(
        "Organization",
        back_populates="deals",
    )

    pipeline = relationship(
        "Pipeline",
        back_populates="deals",
    )

    stage = relationship(
        "PipelineStage",
        back_populates="deals",
    )

    lead = relationship(
        "Lead",
        back_populates="deals",
    )

    contact = relationship(
        "Contact",
        back_populates="deals",
    )

    company = relationship(
        "Company",
        back_populates="deals",
    )

    owner = relationship(
        "User",
        back_populates="deals",
    )