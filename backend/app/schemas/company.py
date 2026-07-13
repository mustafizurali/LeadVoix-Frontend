from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    domain: Optional[str]
    industry: Optional[str]
    company_size: Optional[str]
    website: Optional[str]
    notes: Optional[str]
    status: str
    organization_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
