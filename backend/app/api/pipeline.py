from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.pipeline import (
    PipelineCreate,
    PipelineResponse,
    PipelineUpdate,
    PipelineStageCreate,
    PipelineStageResponse,
    PipelineStageUpdate,
)
from backend.app.services.pipeline import (
    create_pipeline,
    get_pipelines,
    update_pipeline,
    create_stage,
    get_stages,
    update_stage,
)
from backend.app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/pipelines",
    tags=["Pipelines"],
)


# ---------------- Pipeline ---------------- #

@router.post(
    "/",
    response_model=PipelineResponse,
)
def create_new_pipeline(
    pipeline: PipelineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_pipeline(
        db,
        pipeline,
        current_user,
    )


@router.get(
    "/",
    response_model=list[PipelineResponse],
)
def list_pipelines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_pipelines(
        db,
        current_user,
    )


@router.put(
    "/{pipeline_id}",
    response_model=PipelineResponse,
)
def edit_pipeline(
    pipeline_id: int,
    pipeline: PipelineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_pipeline(
        db,
        pipeline_id,
        pipeline,
        current_user,
    )


# ---------------- Pipeline Stages ---------------- #

@router.post(
    "/stages",
    response_model=PipelineStageResponse,
)
def create_pipeline_stage(
    stage: PipelineStageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_stage(
        db,
        stage,
        current_user,
    )


@router.get(
    "/stages",
    response_model=list[PipelineStageResponse],
)
def list_pipeline_stages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_stages(
        db,
        current_user,
    )


@router.put(
    "/stages/{stage_id}",
    response_model=PipelineStageResponse,
)
def edit_pipeline_stage(
    stage_id: int,
    stage: PipelineStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_stage(
        db,
        stage_id,
        stage,
        current_user,
    )