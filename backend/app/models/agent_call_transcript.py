from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from backend.app.db.database import Base


class AgentCallTranscript(Base):
    __tablename__ = "agent_call_transcripts"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    agent_call_id = Column(
        Integer,
        ForeignKey("agent_calls.id"),
        nullable=False,
    )

    speaker = Column(
        Text,
        nullable=False,
    )

    message = Column(
        Text,
        nullable=False,
    )

    agent_call = relationship(
        "AgentCall",
        back_populates="transcripts",
    )