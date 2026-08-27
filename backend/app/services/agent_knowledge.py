from sqlalchemy.orm import Session

from backend.app.models.agent_knowledge import AgentKnowledge
from backend.app.schemas.agent_knowledge import (
    AgentKnowledgeCreate,
    AgentKnowledgeUpdate,
)


def create_agent_knowledge(
    db: Session,
    agent_id: int,
    knowledge_data: AgentKnowledgeCreate,
):
    knowledge = AgentKnowledge(
        agent_id=agent_id,
        **knowledge_data.model_dump(),
    )

    db.add(knowledge)
    db.commit()
    db.refresh(knowledge)

    return knowledge


def get_agent_knowledge(
    db: Session,
    knowledge_id: int,
):
    return (
        db.query(AgentKnowledge)
        .filter(AgentKnowledge.id == knowledge_id)
        .first()
    )


def get_agent_knowledge_items(
    db: Session,
    agent_id: int,
):
    return (
        db.query(AgentKnowledge)
        .filter(AgentKnowledge.agent_id == agent_id)
        .all()
    )


def update_agent_knowledge(
    db: Session,
    knowledge: AgentKnowledge,
    knowledge_data: AgentKnowledgeUpdate,
):
    update_data = knowledge_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(knowledge, field, value)

    db.commit()
    db.refresh(knowledge)

    return knowledge


def delete_agent_knowledge(
    db: Session,
    knowledge: AgentKnowledge,
):
    db.delete(knowledge)
    db.commit()