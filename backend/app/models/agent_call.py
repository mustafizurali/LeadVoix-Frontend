from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.db.database import Base


class AgentCall(Base):
    __tablename__ = "agent_calls"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    agent_id = Column(
        Integer,
        ForeignKey("agents.id"),
        nullable=False,
    )

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
    )

    caller_name = Column(
        String,
        nullable=True,
    )

    caller_phone = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="queued",
    )

    direction = Column(
        String,
        nullable=False,
        default="inbound",
    )

    duration = Column(
        Integer,
        nullable=True,
    )

    transcript = Column(
        Text,
        nullable=True,
    )


    recording_url = Column(
        String,
        nullable=True,
    )

    provider_call_id = Column(
        String,
        nullable=True,
        index=True,
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    ended_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    agent = relationship(
        "Agent",
        back_populates="calls",
    )

    organization = relationship(
        "Organization",
        back_populates="agent_calls",
    )

    transcripts = relationship(
    "AgentCallTranscript",
    back_populates="agent_call",
  )

    summary = relationship(
    "AgentCallSummary",
    back_populates="agent_call",
    uselist=False,
  )