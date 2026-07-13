from typing import Optional

from pydantic import BaseModel, EmailStr
from typing import Optional

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

    class Config:
        from_attributes = True
        orm_mode = True


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None