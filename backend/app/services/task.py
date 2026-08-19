from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models.company import Company
from backend.app.models.contact import Contact
from backend.app.models.deal import Deal
from backend.app.models.lead import Lead
from backend.app.models.task import Task
from backend.app.models.user import User

from backend.app.schemas.task import (
    TaskCreate,
    TaskUpdate,
)


def create_task(
    db: Session,
    task: TaskCreate,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    # Validate Deal
    if task.deal_id is not None:
        deal = (
            db.query(Deal)
            .filter(
                Deal.id == task.deal_id,
                Deal.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not deal:
            raise HTTPException(
                status_code=404,
                detail="Deal not found",
            )

    # Validate Lead
    if task.lead_id is not None:
        lead = (
            db.query(Lead)
            .filter(
                Lead.id == task.lead_id,
                Lead.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

    # Validate Contact
    if task.contact_id is not None:
        contact = (
            db.query(Contact)
            .filter(
                Contact.id == task.contact_id,
                Contact.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not contact:
            raise HTTPException(
                status_code=404,
                detail="Contact not found",
            )

    # Validate Company
    if task.company_id  is not None:
        company = (
            db.query(Company)
            .filter(
                Company.id == task.company_id,
                Company.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

    # Validate Assigned User
    if task.assigned_to is not None :
        assignee = (
            db.query(User)
            .filter(
                User.id == task.assigned_to,
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not assignee:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found",
            )

    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        organization_id=current_user.organization_id,
        deal_id=task.deal_id,
        lead_id=task.lead_id,
        contact_id=task.contact_id,
        company_id=task.company_id,
        assigned_to=task.assigned_to,
        created_by=current_user.id,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task
    
    
def get_tasks(
    db: Session,
    current_user: User,
     search: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    assigned_to: int | None = None,
    company_id: int | None = None,
    page: int = 1,
    limit: int = 10,
    sort_by: str = "created_at",
    order: str = "desc",
    ):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )
    query = db.query(Task).filter(Task.organization_id == current_user.organization_id)

    # Search
    if search:
        search_val = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_val),
                Task.description.ilike(search_val),
            )
        )

    # Status filter
    if status:
        query = query.filter(Task.status == status)

    # Priority filter
    if priority:
        query = query.filter(Task.priority == priority)

    # Assigned to filter
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)

    # Company filter
    if company_id:
        query = query.filter(Task.company_id == company_id)

    # Sorting
    allowed_sort_fields = {
        "id": Task.id,
        "title": Task.title,
        "priority": Task.priority,
        "status": Task.status,
        "due_date": Task.due_date,
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Task.created_at,
    )

    if order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Pagination
    total = query.count()

    tasks = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": tasks,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


def get_task(
    db: Session,
    task_id: int,
    current_user: User,
):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    db_task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return db_task 

def update_task(
    db: Session,
    task_id: int,
    task: TaskUpdate,
    current_user: User,
    ):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    db_task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    update_data = task.model_dump(exclude_unset=True)

    # Validate Deal
    if (
        "deal_id" in update_data
        and update_data["deal_id"] is not None
    ):
        deal = (
            db.query(Deal)
            .filter(
                Deal.id == update_data["deal_id"],
                Deal.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not deal:
            raise HTTPException(
                status_code=404,
                detail="Deal not found",
            )

    # Validate Lead
    if (
        "lead_id" in update_data
        and update_data["lead_id"] is not None
    ):
        lead = (
            db.query(Lead)
            .filter(
                Lead.id == update_data["lead_id"],
                Lead.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

    # Validate Contact
    if (
        "contact_id" in update_data
        and update_data["contact_id"] is not None
    ):
        contact = (
            db.query(Contact)
            .filter(
                Contact.id == update_data["contact_id"],
                Contact.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not contact:
            raise HTTPException(
                status_code=404,
                detail="Contact not found",
            )

    # Validate Company
    if (
        "company_id" in update_data
        and update_data["company_id"] is not None
    ):
        company = (
            db.query(Company)
            .filter(
                Company.id == update_data["company_id"],
                Company.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

    # Validate Assigned User
    if (
        "assigned_to" in update_data
        and update_data["assigned_to"] is not None
    ):
        assignee = (
            db.query(User)
            .filter(
                User.id == update_data["assigned_to"],
                User.organization_id == current_user.organization_id,
            )
            .first()
        )

        if not assignee:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found",
            )

    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)

    return db_task

def delete_task(
    db: Session,
    task_id: int,
    current_user: User,
    ):
    if current_user.organization_id is None:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to any organization",
        )

    db_task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not db_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    db.delete(db_task)
    db.commit()

    return {
        "message": "Task deleted successfully",
    }