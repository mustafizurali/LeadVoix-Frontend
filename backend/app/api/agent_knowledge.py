from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.agent import Agent
from backend.app.models.user import User
from backend.app.utils.dependencies import get_current_user
from backend.app.schemas.agent_knowledge import (
    AgentKnowledgeCreate,
    AgentKnowledgeResponse,
    AgentKnowledgeUpdate,
)
from backend.app.services.agent_knowledge import (
    create_agent_knowledge,
    get_agent_knowledge,
    get_agent_knowledge_items,
    update_agent_knowledge,
    delete_agent_knowledge,
)


router = APIRouter(
    prefix="/agents",
    tags=["Agent Knowledge"],
)


@router.post(
    "/{agent_id}/knowledge",
    response_model=AgentKnowledgeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_knowledge(
    agent_id: int,
    knowledge_data: AgentKnowledgeCreate,
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

    return create_agent_knowledge(
        db,
        agent_id,
        knowledge_data,
    )

@router.get(
    "/{agent_id}/knowledge",
    response_model=List[AgentKnowledgeResponse],
)
def get_knowledge_items(
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

    return get_agent_knowledge_items(
        db,
        agent_id,
    )

@router.get(
    "/{agent_id}/knowledge/{knowledge_id}",
    response_model=AgentKnowledgeResponse,
)
def get_knowledge_item(
    agent_id: int,
    knowledge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    knowledge = get_agent_knowledge(
        db,
        knowledge_id,
    )

    if (
        not knowledge
        or knowledge.agent_id != agent_id
        or knowledge.agent.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge item not found",
        )

    return knowledge


@router.put(
    "/{agent_id}/knowledge/{knowledge_id}",
    response_model=AgentKnowledgeResponse,
)
def update_knowledge_item(
    agent_id: int,
    knowledge_id: int,
    knowledge_data: AgentKnowledgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    knowledge = get_agent_knowledge(
        db,
        knowledge_id,
    )

    if (
        not knowledge
        or knowledge.agent_id != agent_id
        or knowledge.agent.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge item not found",
        )

    return update_agent_knowledge(
        db,
        knowledge,
        knowledge_data,
    )


@router.delete(
    "/{agent_id}/knowledge/{knowledge_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_knowledge_item(
    agent_id: int,
    knowledge_id: int,
    db: Session = Depends(get_db),
     current_user: User = Depends(get_current_user),
):
    knowledge = get_agent_knowledge(
    db,
    knowledge_id,
)
    if (
        not knowledge
        or knowledge.agent_id != agent_id
        or knowledge.agent.organization_id != current_user.organization_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge item not found",
        )

    delete_agent_knowledge(
        db,
        knowledge,
    )