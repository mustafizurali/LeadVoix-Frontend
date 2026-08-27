from sqlalchemy.orm import Session

from backend.app.models.agent_call_intelligence import (
    AgentCallIntelligence,
)
from backend.app.schemas.agent_call_intelligence import (
    AgentCallIntelligenceCreate,
    AgentCallIntelligenceUpdate,
)

from backend.app.services.pipeline_automation import (
    automate_pipeline_stage,
)


def create_agent_call_intelligence(
    db: Session,
    agent_call_id: int,
    intelligence_data: AgentCallIntelligenceCreate,
):
    intelligence = AgentCallIntelligence(
        agent_call_id=agent_call_id,
        **intelligence_data.model_dump(),
    )

    db.add(intelligence)
    db.commit()
    db.refresh(intelligence)

    return intelligence


def get_agent_call_intelligence(
    db: Session,
    agent_call_id: int,
):
    return (
        db.query(AgentCallIntelligence)
        .filter(
            AgentCallIntelligence.agent_call_id
            == agent_call_id
        )
        .first()
    )


def update_agent_call_intelligence(
    db: Session,
    intelligence: AgentCallIntelligence,
    intelligence_data: AgentCallIntelligenceUpdate,
):
    update_data = intelligence_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            intelligence,
            field,
            value,
        )

    db.commit()
    db.refresh(intelligence)

    return intelligence


def analyze_call_intelligence(
    transcript_text: str,
):
    text = transcript_text.lower()

    sentiment = "neutral"
    lead_score = 50
    lead_temperature = "warm"
    customer_intent = "general_interest"
    objections = None
    buying_signals = None
    recommended_action = (
        "Send follow-up information"
    )

    # Positive buying signals
    positive_keywords = [
        "interested",
        "pricing",
        "price",
        "demo",
        "schedule",
        "buy",
        "purchase",
        "sign up",
        "get started",
    ]

    positive_matches = [
        keyword
        for keyword in positive_keywords
        if keyword in text
    ]

    if positive_matches:
        sentiment = "positive"
        lead_score += len(positive_matches) * 5

        buying_signals = (
            "Detected interest in: "
            + ", ".join(positive_matches)
        )

    # Strong buying intent
    strong_intent_keywords = [
        "schedule a demo",
        "book a demo",
        "get started",
        "ready to buy",
        "purchase",
    ]

    if any(
        keyword in text
        for keyword in strong_intent_keywords
    ):
        lead_score += 20
        lead_temperature = "hot"
        customer_intent = "high_purchase_intent"
        recommended_action = (
            "Contact the customer immediately "
            "and schedule a demo or sales call"
        )

    # Pricing interest
    elif (
        "pricing" in text
        or "price" in text
        or "cost" in text
    ):
        lead_score += 15
        lead_temperature = "hot"
        customer_intent = "pricing_interest"
        recommended_action = (
            "Send pricing details and schedule "
            "a follow-up call"
        )

    # Objections
    objection_keywords = [
        "too expensive",
        "expensive",
        "not interested",
        "think about it",
        "budget",
        "later",
        "not now",
    ]

    detected_objections = [
        keyword
        for keyword in objection_keywords
        if keyword in text
    ]

    if detected_objections:
        objections = (
            "Detected objections: "
            + ", ".join(detected_objections)
        )

        lead_score -= (
            len(detected_objections) * 10
        )

        if lead_score < 40:
            lead_temperature = "cold"

    # Negative sentiment
    negative_keywords = [
        "not interested",
        "stop calling",
        "no thanks",
        "don't call",
    ]

    if any(
        keyword in text
        for keyword in negative_keywords
    ):
        sentiment = "negative"
        lead_temperature = "cold"
        lead_score = min(lead_score, 20)
        customer_intent = "not_interested"
        recommended_action = (
            "Do not continue aggressive follow-up"
        )

    # Keep score between 0 and 100
    lead_score = max(
        0,
        min(lead_score, 100),
    )

    return {
        "sentiment": sentiment,
        "lead_score": lead_score,
        "lead_temperature": lead_temperature,
        "customer_intent": customer_intent,
        "objections": objections,
        "buying_signals": buying_signals,
        "recommended_action": recommended_action,
    }