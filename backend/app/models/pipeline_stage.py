from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.app.db.database import Base


class PipelineStage(Base):
    __tablename__ = "pipeline_stages"

    id = Column(Integer, primary_key=True, index=True)

    pipeline_id = Column(
        Integer,
        ForeignKey("pipelines.id", ondelete="CASCADE"),
        nullable=False,
    )

    name = Column(
        String,
        nullable=False,
    )

    position = Column(
        Integer,
        nullable=False,
    )

    color = Column(
        String,
        nullable=True,
        default="#3B82F6",
    )

    stage_type = Column(
        String,
        nullable=False,
        default="NORMAL",
    )

    probability = Column(
        Float,
        nullable=False,
        default=0,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    sla_days = Column(
    Integer,
    nullable=False,
    default=0,
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

    pipeline = relationship(
        "Pipeline",
        back_populates="stages",
    )

    deals = relationship(
    "Deal",
    back_populates="stage",
    )