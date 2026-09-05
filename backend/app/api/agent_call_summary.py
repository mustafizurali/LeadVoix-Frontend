from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.agent_call import AgentCall
from backend.app.models.user import User
from backend.app.utils.dependencies import get_current_user

from backend.app.schemas.agent_call_summary import (
    AgentCallSummaryCreate,
    AgentCallSummaryResponse,
    AgentCallSummaryUpdate,
)

from backend.app.services.agent_call_summary import (
    create_agent_call_summary,
    get_agent_call_summary,
    update_agent_call_summary,
    delete_agent_call_summary,
)


router = APIRouter(
    prefix="/agents",
    tags=["Agent Call Summary"],
)


@router.post(
    "/{agent_id}/calls/{call_id}/summary",
    response_model=AgentCallSummaryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_summary(
    agent_id: int,
    call_id: int,
    summary_data: AgentCallSummaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = (
        db.query(AgentCall)
        .filter(
            AgentCall.id == call_id,
            AgentCall.agent_id == agent_id,
            AgentCall.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not agent_call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    existing_summary = get_agent_call_summary(
        db,
        call_id,
    )

    if existing_summary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call summary already exists",
        )

    return create_agent_call_summary(
        db,
        call_id,
        summary_data,
    )


@router.get(
    "/{agent_id}/calls/{call_id}/summary",
    response_model=AgentCallSummaryResponse,
)
def get_summary(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = (
        db.query(AgentCall)
        .filter(
            AgentCall.id == call_id,
            AgentCall.agent_id == agent_id,
            AgentCall.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not agent_call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    summary = get_agent_call_summary(
        db,
        call_id,
    )

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call summary not found",
        )

    return summary


@router.put(
    "/{agent_id}/calls/{call_id}/summary",
    response_model=AgentCallSummaryResponse,
)
def update_summary(
    agent_id: int,
    call_id: int,
    summary_data: AgentCallSummaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = (
        db.query(AgentCall)
        .filter(
            AgentCall.id == call_id,
            AgentCall.agent_id == agent_id,
            AgentCall.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not agent_call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    summary = get_agent_call_summary(
        db,
        call_id,
    )

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call summary not found",
        )

    return update_agent_call_summary(
        db,
        summary,
        summary_data,
    )


@router.delete(
    "/{agent_id}/calls/{call_id}/summary",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_summary(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = (
        db.query(AgentCall)
        .filter(
            AgentCall.id == call_id,
            AgentCall.agent_id == agent_id,
            AgentCall.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not agent_call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    summary = get_agent_call_summary(
        db,
        call_id,
    )

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call summary not found",
        )

    delete_agent_call_summary(
        db,
        summary,
    )

    return None