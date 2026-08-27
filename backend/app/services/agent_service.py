from sqlalchemy.orm import Session

from backend.app.models.agent import Agent
from backend.app.schemas.agent import AgentCreate, AgentUpdate


def create_agent(
    db: Session,
    agent_data: AgentCreate,
    organization_id: int,
) -> Agent:
    agent = Agent(
        name=agent_data.name,
        description=agent_data.description,
        voice=agent_data.voice,
        language=agent_data.language,
        system_prompt=agent_data.system_prompt,
        greeting_message=agent_data.greeting_message,
        is_active=agent_data.is_active,
        organization_id=organization_id,
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)

    return agent


def get_agents(
    db: Session,
    organization_id: int,
):
    return (
        db.query(Agent)
        .filter(
            Agent.organization_id == organization_id
        )
        .order_by(Agent.id.desc())
        .all()
    )


def get_agent_by_id(
    db: Session,
    agent_id: int,
    organization_id: int,
):
    return (
        db.query(Agent)
        .filter(
            Agent.id == agent_id,
            Agent.organization_id == organization_id,
        )
        .first()
    )


def update_agent(
    db: Session,
    agent: Agent,
    agent_data: AgentUpdate,
) -> Agent:
    update_data = agent_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(agent, field, value)

    db.commit()
    db.refresh(agent)

    return agent


def delete_agent(
    db: Session,
    agent: Agent,
) -> None:
    db.delete(agent)
    db.commit()