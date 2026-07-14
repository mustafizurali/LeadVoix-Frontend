from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User

from backend.app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

from backend.app.services.task import (
    create_task,
    get_tasks,
    get_task,
    update_task,
    delete_task,
)

from backend.app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.post(
    "/",
    response_model=TaskResponse,
)
def create_new_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_task(
        db,
        task,
        current_user,
    )


@router.get(
    "/",
    response_model=list[TaskResponse],
)
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tasks(
        db,
        current_user,
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_single_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_task(
        db,
        task_id,
        current_user,
    )


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def edit_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task(
        db,
        task_id,
        task,
        current_user,
    )


@router.delete(
    "/{task_id}",
)
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_task(
        db,
        task_id,
        current_user,
    )