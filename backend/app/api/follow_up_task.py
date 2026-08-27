from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.services.agent_call import (
    get_agent_call,
)

from backend.app.services.follow_up_task import (
    create_follow_up_task,
    get_follow_up_task,
    get_follow_up_tasks_by_call,
    update_follow_up_task,
)

from backend.app.schemas.follow_up_task import (
    FollowUpTaskCreate,
    FollowUpTaskUpdate,
    FollowUpTaskResponse,
)


router = APIRouter(
    prefix="/agents",
    tags=["Follow-up Tasks"],
)


@router.post(
    "/{agent_id}/calls/{call_id}/follow-up-tasks",
    response_model=FollowUpTaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    agent_id: int,
    call_id: int,
    task_data: FollowUpTaskCreate,
    db: Session = Depends(get_db),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    return create_follow_up_task(
        db,
        call_id,
        task_data,
    )


@router.get(
    "/{agent_id}/calls/{call_id}/follow-up-tasks",
    response_model=List[FollowUpTaskResponse],
)
def get_tasks(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    return get_follow_up_tasks_by_call(
        db,
        call_id,
    )


@router.put(
    "/{agent_id}/calls/{call_id}/follow-up-tasks/{task_id}",
    response_model=FollowUpTaskResponse,
)
def update_task(
    agent_id: int,
    call_id: int,
    task_id: int,
    task_data: FollowUpTaskUpdate,
    db: Session = Depends(get_db),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    task = get_follow_up_task(
        db,
        task_id,
    )

    if (
        not task
        or task.agent_call_id != call_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Follow-up task not found",
        )

    return update_follow_up_task(
        db,
        task,
        task_data,
    )