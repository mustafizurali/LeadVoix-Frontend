from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "MEDIUM"
    status: str = "TODO"
    due_date: Optional[date] = None

    deal_id: Optional[int] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None

    deal_id: Optional[int] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    assigned_to: Optional[int] = None


class TaskResponse(BaseModel):
    id: int

    title: str
    description: Optional[str]

    priority: str
    status: str

    due_date: Optional[date]

    organization_id: int

    deal_id: Optional[int]
    lead_id: Optional[int]
    contact_id: Optional[int]
    company_id: Optional[int]

    assigned_to: Optional[int]
    created_by: int

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )