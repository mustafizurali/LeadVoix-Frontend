from sqlalchemy import Column, Integer, String, Text

from backend.app.db.database import Base


class AgentCallIntelligence(Base):
    __tablename__ = "agent_call_intelligence"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    agent_call_id = Column(
        Integer,
        unique=True,
        nullable=False,
        index=True,
    )

    sentiment = Column(
        String(50),
        nullable=True,
    )

    lead_score = Column(
        Integer,
        nullable=True,
    )

    lead_temperature = Column(
        String(50),
        nullable=True,
    )

    customer_intent = Column(
        String(100),
        nullable=True,
    )

    objections = Column(
        Text,
        nullable=True,
    )

    buying_signals = Column(
        Text,
        nullable=True,
    )

    recommended_action = Column(
        Text,
        nullable=True,
    )