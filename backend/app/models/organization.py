from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from backend.app.db.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    slug = Column(String, unique=True, nullable=False)

    plan = Column(
        String,
        nullable=False,
        default="free"
    )

    users = relationship(
        "User",
        back_populates="organization"
    )

    contacts = relationship(
        "Contact",
        back_populates="organization"
    )

    leads = relationship(
        "Lead",
        back_populates="organization"
    )

    companies = relationship(
        "Company",
        back_populates="organization"
    )

    pipelines = relationship(
        "Pipeline",
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    deals = relationship(
    "Deal",
    back_populates="organization",
    )

    tasks = relationship(
    "Task",
    back_populates="organization",
    )