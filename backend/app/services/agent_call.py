from typing import List, Optional

from sqlalchemy.orm import Session

from backend.app.models.agent_call import AgentCall
from backend.app.schemas.agent_call import (
    AgentCallCreate,
    AgentCallUpdate,
)
from backend.app.services.voice import (
    end_voice_call,
    get_voice_call_status,
    initiate_voice_call,
)



def create_agent_call(
    db: Session,
    agent_id: int,
    organization_id: int,
    call_data: AgentCallCreate,
) -> AgentCall:
    agent_call = AgentCall(
        agent_id=agent_id,
        organization_id=organization_id,
        caller_name=call_data.caller_name,
        caller_phone=call_data.caller_phone,
        direction=call_data.direction or "inbound",
        status="queued",
    )

    db.add(agent_call)
    db.commit()
    db.refresh(agent_call)

    return agent_call

def initiate_agent_call(
    db: Session,
    agent_call: AgentCall,
) -> AgentCall:
    voice_result = initiate_voice_call(
        agent_id=agent_call.agent_id,
        phone_number=agent_call.caller_phone,
    )

    agent_call.status = voice_result["status"]

    db.commit()
    db.refresh(agent_call)

    return agent_call


def end_agent_voice_call(
    db: Session,
    agent_call: AgentCall,
    provider_call_id: str,
) -> AgentCall:
    voice_result = end_voice_call(
        provider_call_id,
    )

    agent_call.status = voice_result["status"]

    db.commit()
    db.refresh(agent_call)

    return agent_call


def get_agent_voice_call_status(
    agent_call: AgentCall,
    provider_call_id: str,
) -> dict:
    return get_voice_call_status(
        provider_call_id,
    )


def get_agent_calls(
    db: Session,
    agent_id: int,
) -> List[AgentCall]:
    return (
        db.query(AgentCall)
        .filter(AgentCall.agent_id == agent_id)
        .order_by(AgentCall.created_at.desc())
        .all()
    )


def get_agent_call(
    db: Session,
    call_id: int,
) -> Optional[AgentCall]:
    return (
        db.query(AgentCall)
        .filter(AgentCall.id == call_id)
        .first()
    )


def update_agent_call(
    db: Session,
    agent_call: AgentCall,
    call_data: AgentCallUpdate,
) -> AgentCall:
    update_data = call_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(agent_call, field, value)

    db.commit()
    db.refresh(agent_call)

    return agent_call


def delete_agent_call(
    db: Session,
    agent_call: AgentCall,
) -> None:
    db.delete(agent_call)
    db.commit()