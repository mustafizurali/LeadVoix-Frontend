from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FollowUpTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    status: str = "pending"


class FollowUpTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None


class FollowUpTaskResponse(BaseModel):
    id: int
    agent_call_id: int
    title: str
    description: Optional[str]
    priority: str
    status: str
    is_completed: bool
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = ConfigDict(
        from_attributes=True
    )