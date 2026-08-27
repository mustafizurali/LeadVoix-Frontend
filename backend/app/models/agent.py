from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from backend.app.db.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    voice = Column(
        String,
        nullable=True,
    )

    language = Column(
        String,
        nullable=False,
        default="en",
    )

    system_prompt = Column(
        Text,
        nullable=True,
    )

    greeting_message = Column(
        Text,
        nullable=True,
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

    organization = relationship(
        "Organization",
        back_populates="agents",
    )

    calls = relationship(
    "AgentCall",
    back_populates="agent",
   )

    knowledge_items = relationship(
    "AgentKnowledge",
    back_populates="agent",
    cascade="all, delete-orphan",
    )
