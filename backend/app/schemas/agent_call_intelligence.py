from typing import Optional

from pydantic import BaseModel, ConfigDict


class AgentCallIntelligenceCreate(BaseModel):
    sentiment: Optional[str] = None
    lead_score: Optional[int] = None
    lead_temperature: Optional[str] = None
    customer_intent: Optional[str] = None
    objections: Optional[str] = None
    buying_signals: Optional[str] = None
    recommended_action: Optional[str] = None


class AgentCallIntelligenceUpdate(BaseModel):
    sentiment: Optional[str] = None
    lead_score: Optional[int] = None
    lead_temperature: Optional[str] = None
    customer_intent: Optional[str] = None
    objections: Optional[str] = None
    buying_signals: Optional[str] = None
    recommended_action: Optional[str] = None


class AgentCallIntelligenceResponse(
    AgentCallIntelligenceCreate
):
    id: int
    agent_call_id: int

    model_config = ConfigDict(
        from_attributes=True
    )