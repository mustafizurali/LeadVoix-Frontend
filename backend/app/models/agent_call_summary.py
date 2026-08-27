from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from backend.app.db.database import Base


class AgentCallSummary(Base):
    __tablename__ = "agent_call_summaries"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    agent_call_id = Column(
        Integer,
        ForeignKey("agent_calls.id"),
        nullable=False,
        unique=True,
    )

    summary = Column(
        Text,
        nullable=True,
    )

    key_points = Column(
        Text,
        nullable=True,
    )

    outcome = Column(
        Text,
        nullable=True,
    )

    next_action = Column(
        Text,
        nullable=True,
    )

    agent_call = relationship(
        "AgentCall",
        back_populates="summary",
    )