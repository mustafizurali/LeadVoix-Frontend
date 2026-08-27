from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.pipeline import (
    PipelineCreate,
    PipelineListResponse,
    PipelineResponse,
    PipelineStageCreate,
    PipelineStageListResponse,
    PipelineStageResponse,
    PipelineStageUpdate,
    PipelineUpdate,
)
from backend.app.services.pipeline import (
    create_pipeline,
    create_stage,
    delete_pipeline,
    delete_stage,
    get_pipelines,
    get_stages,
    update_pipeline,
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
        db=db,
        pipeline=pipeline,
        current_user=current_user,
    )


@router.get(
    "/",
    response_model=PipelineListResponse,
)
def list_pipelines(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_pipelines(
        db=db,
        current_user=current_user,
        page=page,
        limit=limit,
        search=search,
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
        db=db,
        pipeline_id=pipeline_id,
        pipeline=pipeline,
        current_user=current_user,
    )


@router.delete(
    "/{pipeline_id}",
)
def remove_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_pipeline(
        db=db,
        pipeline_id=pipeline_id,
        current_user=current_user,
    )


# ---------------- Pipeline Stages ---------------- #


@router.post(
    "/{pipeline_id}/stages",
    response_model=PipelineStageResponse,
)
def create_pipeline_stage(
    pipeline_id: int,
    stage: PipelineStageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_stage(
        db=db,
        pipeline_id=pipeline_id,
        stage=stage,
        current_user=current_user,
    )


@router.get(
    "/{pipeline_id}/stages",
    response_model=PipelineStageListResponse,
)
def list_pipeline_stages(
    pipeline_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_stages(
        db=db,
        pipeline_id=pipeline_id,
        current_user=current_user,
        page=page,
        limit=limit,
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
        db=db,
        stage_id=stage_id,
        stage=stage,
        current_user=current_user,
    )


@router.delete(
    "/stages/{stage_id}",
)
def remove_pipeline_stage(
    stage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_stage(
        db=db,
        stage_id=stage_id,
        current_user=current_user,
    )