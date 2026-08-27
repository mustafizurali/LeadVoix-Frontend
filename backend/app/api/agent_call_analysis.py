from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.services.agent_call import (
    get_agent_call,
)

from backend.app.services.agent_call_analysis import (
    build_transcript_text,
    analyze_call_transcript,
)

from backend.app.services.agent_call_summary import (
    create_agent_call_summary,
    get_agent_call_summary,
    update_agent_call_summary,
)

from backend.app.schemas.agent_call_summary import (
    AgentCallSummaryCreate,
    AgentCallSummaryUpdate,
    AgentCallSummaryResponse,
)


router = APIRouter(
    prefix="/agents",
    tags=["Agent Call Analysis"],
)


@router.post(
    "/{agent_id}/calls/{call_id}/analyze",
    response_model=AgentCallSummaryResponse,
    status_code=status.HTTP_200_OK,
)
def analyze_call(
    agent_id: int,
    call_id: int,
    db: Session = Depends(get_db),
):
    agent_call = get_agent_call(
        db,
        call_id,
    )

    if (
        not agent_call
        or agent_call.agent_id != agent_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent call not found",
        )

    transcript_text = build_transcript_text(
        db,
        call_id,
    )

    if not transcript_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transcript available for this call",
        )

    analysis = analyze_call_transcript(
        transcript_text,
    )

    existing_summary = get_agent_call_summary(
        db,
        call_id,
    )

    if existing_summary:
        summary_data = AgentCallSummaryUpdate(
            summary=analysis["summary"],
            key_points=analysis["key_points"],
            outcome=analysis["outcome"],
            next_action=analysis["next_action"],
        )

        return update_agent_call_summary(
            db,
            existing_summary,
            summary_data,
        )

    summary_data = AgentCallSummaryCreate(
        summary=analysis["summary"],
        key_points=analysis["key_points"],
        outcome=analysis["outcome"],
        next_action=analysis["next_action"],
    )

    return create_agent_call_summary(
        db,
        call_id,
        summary_data,
    )