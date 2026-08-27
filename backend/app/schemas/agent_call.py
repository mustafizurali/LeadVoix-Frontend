from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AgentCallCreate(BaseModel):
    caller_name: Optional[str] = None
    caller_phone: Optional[str] = None
    direction: Optional[str] = "inbound"


class AgentCallUpdate(BaseModel):
    status: Optional[str] = None
    duration: Optional[int] = None
    transcript: Optional[str] = None
    recording_url: Optional[str] = None
    provider_call_id: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class AgentCallResponse(BaseModel):
    id: int
    agent_id: int
    organization_id: int
    caller_name: Optional[str] = None
    caller_phone: Optional[str] = None
    status: str
    direction: str
    duration: Optional[int] = None
    transcript: Optional[str] = None

    recording_url: Optional[str] = None
    provider_call_id: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )