from typing import Optional

from pydantic import BaseModel, ConfigDict


class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    voice: Optional[str] = None
    language: str = "en"
    system_prompt: Optional[str] = None
    greeting_message: Optional[str] = None
    is_active: bool = True


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    voice: Optional[str] = None
    language: Optional[str] = None
    system_prompt: Optional[str] = None
    greeting_message: Optional[str] = None
    is_active: Optional[bool] = None


class AgentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    voice: Optional[str]
    language: str
    system_prompt: Optional[str]
    greeting_message: Optional[str]
    is_active: bool
    organization_id: int

    model_config = ConfigDict(
        from_attributes=True
    )