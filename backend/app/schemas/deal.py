from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DealCreate(BaseModel):
    title: str

    amount: Decimal = Decimal("0.00")
    currency: str = "USD"
    status: str = "OPEN"

    expected_close_date: Optional[date] = None
    description: Optional[str] = None

    pipeline_id: Optional[int] = None
    stage_id: Optional[int] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    owner_id: Optional[int] = None


class DealResponse(BaseModel):
    id: int

    title: str
    amount: Decimal
    currency: str
    status: str

    expected_close_date: Optional[date]
    description: Optional[str]

    organization_id: int

    pipeline_id: Optional[int]
    stage_id: Optional[int]
    lead_id: Optional[int]
    contact_id: Optional[int]
    company_id: Optional[int]
    owner_id: Optional[int]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class DealUpdate(BaseModel):
    title: Optional[str] = None

    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    status: Optional[str] = None

    expected_close_date: Optional[date] = None
    description: Optional[str] = None

    pipeline_id: Optional[int] = None
    stage_id: Optional[int] = None
    lead_id: Optional[int] = None
    contact_id: Optional[int] = None
    company_id: Optional[int] = None
    owner_id: Optional[int] = None