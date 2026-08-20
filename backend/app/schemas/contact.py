from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class ContactCreate(BaseModel):
    first_name: str

    last_name: Optional[str] = None

    email: Optional[EmailStr] = None

    phone: Optional[str] = None

    company: Optional[str] = None


class ContactResponse(BaseModel):
    id: int

    first_name: str

    last_name: Optional[str]

    email: Optional[EmailStr]

    phone: Optional[str]

    company: Optional[str]

    status: str

    organization_id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None

    last_name: Optional[str] = None

    email: Optional[EmailStr] = None

    phone: Optional[str] = None

    company: Optional[str] = None

    status: Optional[str] = None


class ContactListResponse(BaseModel):
    items: list[ContactResponse]

    total: int

    page: int

    limit: int

    total_pages: int