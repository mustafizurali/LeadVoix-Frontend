from pydantic import BaseModel


class OrganizationCreate(BaseModel):
    name: str


class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    plan: str

    class Config:
        from_attributes = True