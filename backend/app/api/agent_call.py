from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.agent import Agent
from backend.app.models.user import User
from backend.app.utils.dependencies import get_current_user

from backend.app.schemas.agent_call import (
    AgentCallCreate,
    AgentCallResponse,
    AgentCallUpdate,
)

from backend.app.services.agent_call import (
    create_agent_call,
    get_agent_calls,
    get_agent_call,
    update_agent_call,
    delete_agent_call,
)

from backend.app.services.voice_call import (
    initiate_voice_call,
    end_voice_call,
)


router = APIRouter(
    prefix="/agents",
    tags=["Agent Calls"],
)


# ============================================================
# CREATE AGENT CALL
# ============================================================

@router.post(
    "/{agent_id}/calls",
    response_model=AgentCallResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_call(
    agent_id: int,
    call_data: AgentCallCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == agent_id,
            Agent.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return create_agent_call(
        db,
        agent_id,
        agent.organization_id,
        call_data,
    )


# ============================================================
# INITIATE AGENT CALL
# ============================================================

@router.post(
    "/{agent_id}/calls/{call_id}/initiate",
    response_model=AgentCallResponse,
)
def initiate_call(
    agent_id: int,
    call_id: int,
    to_number: str,
    from_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == agent_id,
            Agent.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
        or agent_call.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    return initiate_voice_call(
        db=db,
        agent=agent,
        agent_call=agent_call,
        to_number=to_number,
        from_number=from_number,
    )


# ============================================================
# END AGENT CALL
# ============================================================

@router.post(
    "/{agent_id}/calls/{call_id}/end",
    response_model=AgentCallResponse,
)
def end_call(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
        or agent_call.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    if not agent_call.provider_call_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call has not been initiated",
        )

    return end_voice_call(
        db=db,
        agent_call=agent_call,
    )


# ============================================================
# GET ALL CALLS FOR AGENT
# ============================================================

@router.get(
    "/{agent_id}/calls",
    response_model=List[AgentCallResponse],
)
def get_calls(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = (
        db.query(Agent)
        .filter(
            Agent.id == agent_id,
            Agent.organization_id == current_user.organization_id,
        )
        .first()
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return get_agent_calls(
        db,
        agent_id,
    )


# ============================================================
# GET SINGLE AGENT CALL
# ============================================================

@router.get(
    "/{agent_id}/calls/{call_id}",
    response_model=AgentCallResponse,
)
def get_call(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
        or agent_call.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    return agent_call


# ============================================================
# UPDATE AGENT CALL
# ============================================================

@router.put(
    "/{agent_id}/calls/{call_id}",
    response_model=AgentCallResponse,
)
def update_call(
    agent_id: int,
    call_id: int,
    call_data: AgentCallUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
        or agent_call.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    return update_agent_call(
        db,
        agent_call,
        call_data,
    )


# ============================================================
# DELETE AGENT CALL
# ============================================================

@router.delete(
    "/{agent_id}/calls/{call_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_call(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
        or agent_call.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    delete_agent_call(
        db,
        agent_call,
    )