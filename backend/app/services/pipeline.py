from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.pipeline import Pipeline
from backend.app.models.pipeline_stage import PipelineStage
from backend.app.models.user import User
from backend.app.schemas.pipeline import (
    PipelineCreate,
    PipelineUpdate,
    PipelineStageCreate,
    PipelineStageUpdate,
)


def create_pipeline(
    db: Session,
    pipeline: PipelineCreate,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    db_pipeline = Pipeline(
        name=pipeline.name,
        description=pipeline.description,
        color=pipeline.color,
        is_default=pipeline.is_default,
        is_active=pipeline.is_active,
        organization_id=current_user.organization_id,
    )

    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)

    return db_pipeline


def get_pipelines(
    db: Session,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    return (
        db.query(Pipeline)
        .filter(
            Pipeline.organization_id == current_user.organization_id
        )
        .order_by(Pipeline.created_at.desc())
        .all()
    )


def update_pipeline(
    db: Session,
    pipeline_id: int,
    pipeline: PipelineUpdate,
    current_user: User,
):
    db_pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_pipeline:
        raise HTTPException(
            status_code=404,
            detail="Pipeline not found"
        )

    update_data = pipeline.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_pipeline, key, value)

    db.commit()
    db.refresh(db_pipeline)

    return db_pipeline


def create_stage(
    db: Session,
    stage: PipelineStageCreate,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    db_pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == stage.pipeline_id,
            Pipeline.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_pipeline:
        raise HTTPException(
            status_code=404,
            detail="Pipeline not found"
        )

    db_stage = PipelineStage(
        pipeline_id=stage.pipeline_id,
        name=stage.name,
        position=stage.position,
        color=stage.color,
        stage_type=stage.stage_type,
        probability=stage.probability,
        sla_days=stage.sla_days,
        is_active=stage.is_active,
    )

    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)

    return db_stage


def get_stages(
    db: Session,
    current_user: User,
):
    print("========== DEBUG ==========")
    print("ID:", current_user.id)
    print("EMAIL:", current_user.email)
    print("ORG:", current_user.organization_id)
    print("===========================")
    
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization"
        )

    return (
        db.query(PipelineStage)
        .join(Pipeline)
        .filter(
            Pipeline.organization_id == current_user.organization_id
        )
        .order_by(PipelineStage.position)
        .all()
    )


def update_stage(
    db: Session,
    stage_id: int,
    stage: PipelineStageUpdate,
    current_user: User,
):
    db_stage = (
        db.query(PipelineStage)
        .join(Pipeline)
        .filter(
            PipelineStage.id == stage_id,
            Pipeline.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_stage:
        raise HTTPException(
            status_code=404,
            detail="Pipeline stage not found"
        )

    update_data = stage.model_dump(exclude_unset=True)

    if "pipeline_id" in update_data:
        db_pipeline = (
            db.query(Pipeline)
            .filter(
                Pipeline.id == update_data["pipeline_id"],
                Pipeline.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not db_pipeline:
            raise HTTPException(
                status_code=404,
                detail="Pipeline not found"
            )

    for key, value in update_data.items():
        setattr(db_stage, key, value)

    db.commit()
    db.refresh(db_stage)

    return db_stage
