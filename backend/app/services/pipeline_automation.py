from sqlalchemy.orm import Session

from backend.app.models.lead import Lead


def automate_pipeline_stage(
    db: Session,
    lead: Lead,
    lead_temperature: str,
    customer_intent: str,
):
    # Normalize AI values
    lead_temperature = (
        lead_temperature.lower().strip()
        if lead_temperature
        else ""
    )

    customer_intent = (
        customer_intent.lower().strip()
        if customer_intent
        else ""
    )

    # Intent has higher priority
    if customer_intent == "not_interested":

        lead.status = "lost"

    elif customer_intent == "high_purchase_intent":

        lead.status = "qualified"

    elif customer_intent == "pricing_interest":

        lead.status = "interested"

    # Otherwise use lead temperature
    elif lead_temperature == "hot":

        lead.status = "qualified"

    elif lead_temperature == "warm":

        lead.status = "follow_up"

    elif lead_temperature == "cold":

        lead.status = "cold"

    db.commit()

    db.refresh(lead)

    return lead