from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.app.models.agent import Agent
from backend.app.models.agent_call import AgentCall
from backend.app.services.mock_voice_provider import MockVoiceProvider


def initiate_voice_call(
    db: Session,
    agent: Agent,
    agent_call: AgentCall,
    to_number: str,
    from_number: str,
):
    provider = MockVoiceProvider()

    result = provider.initiate_call(
        to_number=to_number,
        from_number=from_number,
        agent_id=agent.id,
    )

    agent_call.provider_call_id = result["provider_call_id"]
    agent_call.status = result["status"]
    agent_call.started_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(agent_call)

    return agent_call


def end_voice_call(
    db: Session,
    agent_call: AgentCall,
):
    provider = MockVoiceProvider()

    result = provider.end_call(
        provider_call_id=agent_call.provider_call_id,
    )

    agent_call.status = result["status"]
    agent_call.ended_at = datetime.now(timezone.utc)

    if agent_call.started_at:
        duration = (
            agent_call.ended_at
            - agent_call.started_at
        )

        agent_call.duration = int(
            duration.total_seconds()
        )

    db.commit()
    db.refresh(agent_call)

    return agent_call