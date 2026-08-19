from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User

from backend.app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
     TaskListResponse,
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
    response_model=TaskListResponse,
)
def list_tasks(
    search: str | None = Query(None),
    status: str | None = Query(None),
    priority: str | None = Query(None),
    assigned_to: int | None = Query(None),
    company_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tasks(
        db=db,
        current_user=current_user,
        search=search,
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        company_id=company_id,
        page=page,
        limit=limit,
        sort_by=sort_by,
        order=order,
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