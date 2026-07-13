from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.db.database import Base


class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    color = Column(
        String,
        nullable=True,
        default="#2563EB",
    )

    is_default = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
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
        back_populates="pipelines",
    )

    stages = relationship(
        "PipelineStage",
        back_populates="pipeline",
        cascade="all, delete-orphan",
    )

    deals = relationship(
    "Deal",
    back_populates="pipeline",
    )