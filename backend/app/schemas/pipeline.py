from typing import Optional

from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PipelineCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    is_default: bool = False
    is_active: bool = True
    


class PipelineResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    color: Optional[str]
    is_default: bool
    is_active: bool
    organization_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    


class PipelineStageCreate(BaseModel):
    pipeline_id: int
    name: str
    position: int
    color: Optional[str] = None
    stage_type: str = "NORMAL"
    probability: float = 0
    sla_days: int = 0
    is_active: bool = True


class PipelineStageResponse(BaseModel):
    id: int
    pipeline_id: int
    name: str
    position: int
    color: Optional[str]
    stage_type: str
    probability: float
    sla_days: int
    is_active: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PipelineStageUpdate(BaseModel):
    pipeline_id: Optional[int] = None
    name: Optional[str] = None
    position: Optional[int] = None
    color: Optional[str] = None
    stage_type: Optional[str] = None
    probability: Optional[float] = None
    sla_days: Optional[int] = None
    is_active: Optional[bool] = None
