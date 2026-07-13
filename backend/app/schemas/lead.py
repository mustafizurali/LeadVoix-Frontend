from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime


class LeadCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    company: Optional[str]
    source: Optional[str]
    notes: Optional[str]
    status: str
    organization_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
