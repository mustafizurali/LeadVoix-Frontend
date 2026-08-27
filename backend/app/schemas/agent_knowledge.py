from typing import Optional

from pydantic import BaseModel


class AgentKnowledgeCreate(BaseModel):
    title: str
    content: str
    source_type: Optional[str] = "manual"
    is_active: Optional[bool] = True


class AgentKnowledgeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source_type: Optional[str] = None
    is_active: Optional[bool] = None


class AgentKnowledgeResponse(BaseModel):
    id: int
    title: str
    content: str
    source_type: str
    is_active: bool
    agent_id: int

    class Config:
        from_attributes = True