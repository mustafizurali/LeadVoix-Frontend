from typing import List

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

from backend.app.services.agent_call import get_agent_call

from backend.app.schemas.agent_call_transcript import (
    AgentCallTranscriptCreate,
    AgentCallTranscriptResponse,
    AgentCallTranscriptUpdate,
)

from backend.app.services.agent_call_transcript import (
    create_agent_call_transcript,
    get_agent_call_transcript,
    get_agent_call_transcripts,
    update_agent_call_transcript,
    delete_agent_call_transcript,
)


router = APIRouter(
    prefix="/agents",
    tags=["Agent Call Transcripts"],
)


@router.post(
    "/{agent_id}/calls/{call_id}/transcripts",
    response_model=AgentCallTranscriptResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transcript(
    agent_id: int,
    call_id: int,
    transcript_data: AgentCallTranscriptCreate,
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

    return create_agent_call_transcript(
        db,
        call_id,
        transcript_data,
    )


@router.get(
    "/{agent_id}/calls/{call_id}/transcripts",
    response_model=List[AgentCallTranscriptResponse],
)
def get_transcripts(
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

    return get_agent_call_transcripts(
        db,
        call_id,
    )


@router.get(
    "/{agent_id}/calls/{call_id}/transcripts/{transcript_id}",
    response_model=AgentCallTranscriptResponse,
)
def get_transcript(
    agent_id: int,
    call_id: int,
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transcript = get_agent_call_transcript(
        db,
        transcript_id,
    )

    if (
        not transcript
        or transcript.agent_call_id != call_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not found",
        )

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

    return transcript


@router.put(
    "/{agent_id}/calls/{call_id}/transcripts/{transcript_id}",
    response_model=AgentCallTranscriptResponse,
)
def update_transcript(
    agent_id: int,
    call_id: int,
    transcript_id: int,
    transcript_data: AgentCallTranscriptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transcript = get_agent_call_transcript(
        db,
        transcript_id,
    )

    if (
        not transcript
        or transcript.agent_call_id != call_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not found",
        )

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

    return update_agent_call_transcript(
        db,
        transcript,
        transcript_data,
    )


@router.delete(
    "/{agent_id}/calls/{call_id}/transcripts/{transcript_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transcript(
    agent_id: int,
    call_id: int,
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transcript = get_agent_call_transcript(
        db,
        transcript_id,
    )

    if (
        not transcript
        or transcript.agent_call_id != call_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not found",
        )

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

    delete_agent_call_transcript(
        db,
        transcript,
    )

    return None