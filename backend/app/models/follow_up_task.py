from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
)

from backend.app.db.database import Base


class FollowUpTask(Base):
    __tablename__ = "follow_up_tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    agent_call_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    priority = Column(
        String(50),
        nullable=False,
        default="medium",
    )

    status = Column(
        String(50),
        nullable=False,
        default="pending",
    )

    is_completed = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )