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


class AgentKnowledge(Base):
    __tablename__ = "agent_knowledge"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
    )

    source_type = Column(
        String,
        nullable=False,
        default="manual",
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    agent_id = Column(
        Integer,
        ForeignKey("agents.id"),
        nullable=False,
    )

    agent = relationship(
        "Agent",
        back_populates="knowledge_items",
    )