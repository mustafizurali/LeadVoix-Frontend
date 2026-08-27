from typing import List, Optional

from sqlalchemy.orm import Session

from backend.app.models.agent_call_transcript import (
    AgentCallTranscript,
)
from backend.app.schemas.agent_call_transcript import (
    AgentCallTranscriptCreate,
    AgentCallTranscriptUpdate,
)


def create_agent_call_transcript(
    db: Session,
    agent_call_id: int,
    transcript_data: AgentCallTranscriptCreate,
) -> AgentCallTranscript:
    transcript = AgentCallTranscript(
        agent_call_id=agent_call_id,
        speaker=transcript_data.speaker,
        message=transcript_data.message,
    )

    db.add(transcript)
    db.commit()
    db.refresh(transcript)

    return transcript


def get_agent_call_transcript(
    db: Session,
    transcript_id: int,
) -> Optional[AgentCallTranscript]:
    return (
        db.query(AgentCallTranscript)
        .filter(
            AgentCallTranscript.id == transcript_id
        )
        .first()
    )


def get_agent_call_transcripts(
    db: Session,
    agent_call_id: int,
) -> List[AgentCallTranscript]:
    return (
        db.query(AgentCallTranscript)
        .filter(
            AgentCallTranscript.agent_call_id
            == agent_call_id
        )
        .order_by(
            AgentCallTranscript.id.asc()
        )
        .all()
    )


def update_agent_call_transcript(
    db: Session,
    transcript: AgentCallTranscript,
    transcript_data: AgentCallTranscriptUpdate,
) -> AgentCallTranscript:
    update_data = transcript_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(
            transcript,
            field,
            value,
        )

    db.commit()
    db.refresh(transcript)

    return transcript


def delete_agent_call_transcript(
    db: Session,
    transcript: AgentCallTranscript,
) -> None:
    db.delete(transcript)
    db.commit()