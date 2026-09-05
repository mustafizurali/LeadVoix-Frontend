from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class DemoRequestCreate(BaseModel):
    name: str
    email: EmailStr
    company: str
    phone: Optional[str] = None
    message: Optional[str] = None


class DemoRequestResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    company: str
    phone: Optional[str]
    message: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )