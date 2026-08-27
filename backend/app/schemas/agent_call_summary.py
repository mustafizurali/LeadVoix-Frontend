from typing import Optional

from pydantic import BaseModel, ConfigDict


class AgentCallSummaryCreate(BaseModel):
    summary: Optional[str] = None
    key_points: Optional[str] = None
    outcome: Optional[str] = None
    next_action: Optional[str] = None


class AgentCallSummaryUpdate(BaseModel):
    summary: Optional[str] = None
    key_points: Optional[str] = None
    outcome: Optional[str] = None
    next_action: Optional[str] = None


class AgentCallSummaryResponse(BaseModel):
    id: int
    agent_call_id: int
    summary: Optional[str]
    key_points: Optional[str]
    outcome: Optional[str]
    next_action: Optional[str]

    model_config = ConfigDict(
        from_attributes=True,
    )