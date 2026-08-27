from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
)
from backend.app.services import agent_service

router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


@router.post(
    "",
    response_model=AgentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_agent(
    agent_data: AgentCreate,
    db: Session = Depends(get_db),
):
    organization_id = 1

    return agent_service.create_agent(
        db=db,
        agent_data=agent_data,
        organization_id=organization_id,
    )


@router.get(
    "",
    response_model=List[AgentResponse],
)
def get_agents(
    db: Session = Depends(get_db),
):
    organization_id = 1

    return agent_service.get_agents(
        db=db,
        organization_id=organization_id,
    )


@router.get(
    "/{agent_id}",
    response_model=AgentResponse,
)
def get_agent(
    agent_id: int,
    db: Session = Depends(get_db),
):
    organization_id = 1

    agent = agent_service.get_agent_by_id(
        db=db,
        agent_id=agent_id,
        organization_id=organization_id,
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return agent


@router.put(
    "/{agent_id}",
    response_model=AgentResponse,
)
def update_agent(
    agent_id: int,
    agent_data: AgentUpdate,
    db: Session = Depends(get_db),
):
    organization_id = 1

    agent = agent_service.get_agent_by_id(
        db=db,
        agent_id=agent_id,
        organization_id=organization_id,
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return agent_service.update_agent(
        db=db,
        agent=agent,
        agent_data=agent_data,
    )


@router.delete(
    "/{agent_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_agent(
    agent_id: int,
    db: Session = Depends(get_db),
):
    organization_id = 1

    agent = agent_service.get_agent_by_id(
        db=db,
        agent_id=agent_id,
        organization_id=organization_id,
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    agent_service.delete_agent(
        db=db,
        agent=agent,
    )