from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.db.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    priority = Column(
        String,
        nullable=False,
        default="MEDIUM",
    )

    status = Column(
        String,
        nullable=False,
        default="TODO",
    )

    due_date = Column(
        Date,
        nullable=True,
    )

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
    )

    deal_id = Column(
        Integer,
        ForeignKey("deals.id"),
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

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
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
        back_populates="tasks",
    )

    deal = relationship(
        "Deal",
        back_populates="tasks",
    )

    lead = relationship(
        "Lead",
        back_populates="tasks",
    )

    contact = relationship(
        "Contact",
        back_populates="tasks",
    )

    company = relationship(
        "Company",
        back_populates="tasks",
    )

    assignee = relationship(
        "User",
        foreign_keys=[assigned_to],
        back_populates="assigned_tasks",
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_tasks",
    )