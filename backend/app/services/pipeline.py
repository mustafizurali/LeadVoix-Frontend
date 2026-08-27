from fastapi import HTTPException
from sqlalchemy import or_
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


def get_user_organization_id(
    current_user: User,
) -> int:
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    return current_user.organization_id


def create_pipeline(
    db: Session,
    pipeline: PipelineCreate,
    current_user: User,
):
    organization_id = get_user_organization_id(
        current_user
    )

    if pipeline.is_default:
        db.query(Pipeline).filter(
            Pipeline.organization_id == organization_id,
            Pipeline.is_default == True,
        ).update(
            {"is_default": False},
            synchronize_session=False,
        )

    db_pipeline = Pipeline(
        name=pipeline.name,
        description=pipeline.description,
        color=pipeline.color,
        is_default=pipeline.is_default,
        is_active=pipeline.is_active,
        organization_id=organization_id,
    )

    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)

    return db_pipeline


def get_pipelines(
    db: Session,
    current_user: User,
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
):
    organization_id = get_user_organization_id(
        current_user
    )

    query = db.query(Pipeline).filter(
        Pipeline.organization_id == organization_id
    )

    if search:
        query = query.filter(
            or_(
                Pipeline.name.ilike(f"%{search}%"),
                Pipeline.description.ilike(f"%{search}%"),
            )
        )

    total = query.count()

    offset = (page - 1) * limit

    pipelines = (
        query
        .order_by(Pipeline.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    total_pages = (
        (total + limit - 1) // limit
        if total > 0
        else 0
    )

    return {
        "items": pipelines,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


def update_pipeline(
    db: Session,
    pipeline_id: int,
    pipeline: PipelineUpdate,
    current_user: User,
):
    organization_id = get_user_organization_id(
        current_user
    )

    db_pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.organization_id == organization_id,
        )
        .first()
    )

    if not db_pipeline:
        raise HTTPException(
            status_code=404,
            detail="Pipeline not found",
        )

    update_data = pipeline.model_dump(
        exclude_unset=True
    )

    if update_data.get("is_default") is True:
        db.query(Pipeline).filter(
            Pipeline.organization_id == organization_id,
            Pipeline.id != pipeline_id,
            Pipeline.is_default == True,
        ).update(
            {"is_default": False},
            synchronize_session=False,
        )

    for key, value in update_data.items():
        setattr(db_pipeline, key, value)

    db.commit()
    db.refresh(db_pipeline)

    return db_pipeline


def delete_pipeline(
    db: Session,
    pipeline_id: int,
    current_user: User,
):
    organization_id = get_user_organization_id(
        current_user
    )

    db_pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.organization_id == organization_id,
        )
        .first()
    )

    if not db_pipeline:
        raise HTTPException(
            status_code=404,
            detail="Pipeline not found",
        )

    db.delete(db_pipeline)
    db.commit()

    return {
        "message": "Pipeline deleted successfully"
    }


def create_stage(
    db: Session,
    pipeline_id: int,
    stage: PipelineStageCreate,
    current_user: User,
):
    organization_id = get_user_organization_id(
        current_user
    )

    db_pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.organization_id == organization_id,
        )
        .first()
    )

    if not db_pipeline:
        raise HTTPException(
            status_code=404,
            detail="Pipeline not found",
        )

    existing_position = (
        db.query(PipelineStage)
        .filter(
            PipelineStage.pipeline_id == pipeline_id,
            PipelineStage.position == stage.position,
        )
        .first()
    )

    if existing_position:
        raise HTTPException(
            status_code=400,
            detail="A stage already exists at this position",
        )

    db_stage = PipelineStage(
        pipeline_id=pipeline_id,
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
    pipeline_id: int,
    current_user: User,
    page: int = 1,
    limit: int = 50,
):
    organization_id = get_user_organization_id(
        current_user
    )

    db_pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.organization_id == organization_id,
        )
        .first()
    )

    if not db_pipeline:
        raise HTTPException(
            status_code=404,
            detail="Pipeline not found",
        )

    query = db.query(PipelineStage).filter(
        PipelineStage.pipeline_id == pipeline_id
    )

    total = query.count()

    offset = (page - 1) * limit

    stages = (
        query
        .order_by(PipelineStage.position.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    total_pages = (
        (total + limit - 1) // limit
        if total > 0
        else 0
    )

    return {
        "items": stages,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


def update_stage(
    db: Session,
    stage_id: int,
    stage: PipelineStageUpdate,
    current_user: User,
):
    organization_id = get_user_organization_id(
        current_user
    )

    db_stage = (
        db.query(PipelineStage)
        .join(Pipeline)
        .filter(
            PipelineStage.id == stage_id,
            Pipeline.organization_id == organization_id,
        )
        .first()
    )

    if not db_stage:
        raise HTTPException(
            status_code=404,
            detail="Pipeline stage not found",
        )

    update_data = stage.model_dump(
        exclude_unset=True
    )

    if "position" in update_data:
        existing_position = (
            db.query(PipelineStage)
            .filter(
                PipelineStage.pipeline_id
                == db_stage.pipeline_id,
                PipelineStage.position
                == update_data["position"],
                PipelineStage.id != stage_id,
            )
            .first()
        )

        if existing_position:
            raise HTTPException(
                status_code=400,
                detail="A stage already exists at this position",
            )

    for key, value in update_data.items():
        setattr(db_stage, key, value)

    db.commit()
    db.refresh(db_stage)

    return db_stage


def delete_stage(
    db: Session,
    stage_id: int,
    current_user: User,
):
    organization_id = get_user_organization_id(
        current_user
    )

    db_stage = (
        db.query(PipelineStage)
        .join(Pipeline)
        .filter(
            PipelineStage.id == stage_id,
            Pipeline.organization_id == organization_id,
        )
        .first()
    )

    if not db_stage:
        raise HTTPException(
            status_code=404,
            detail="Pipeline stage not found",
        )

    db.delete(db_stage)
    db.commit()

    return {
        "message": "Pipeline stage deleted successfully"
    }