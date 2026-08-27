from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.app.models.follow_up_task import (
    FollowUpTask,
)
from backend.app.schemas.follow_up_task import (
    FollowUpTaskCreate,
    FollowUpTaskUpdate,
)


def create_follow_up_task(
    db: Session,
    agent_call_id: int,
    task_data: FollowUpTaskCreate,
):
    task = FollowUpTask(
        agent_call_id=agent_call_id,
        **task_data.model_dump(),
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def get_follow_up_task(
    db: Session,
    task_id: int,
):
    return (
        db.query(FollowUpTask)
        .filter(
            FollowUpTask.id == task_id
        )
        .first()
    )


def get_follow_up_tasks_by_call(
    db: Session,
    agent_call_id: int,
):
    return (
        db.query(FollowUpTask)
        .filter(
            FollowUpTask.agent_call_id
            == agent_call_id
        )
        .order_by(
            FollowUpTask.created_at.desc()
        )
        .all()
    )


def get_pending_follow_up_task(
    db: Session,
    agent_call_id: int,
):
    return (
        db.query(FollowUpTask)
        .filter(
            FollowUpTask.agent_call_id
            == agent_call_id,
            FollowUpTask.is_completed == False,
        )
        .first()
    )


def update_follow_up_task(
    db: Session,
    task: FollowUpTask,
    task_data: FollowUpTaskUpdate,
):
    update_data = task_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            task,
            field,
            value,
        )

    if (
        task.is_completed
        and task.completed_at is None
    ):
        task.completed_at = datetime.now(
            timezone.utc
        )

    db.commit()
    db.refresh(task)

    return task