from typing import Dict

from sqlalchemy.orm import Session

from backend.app.services.agent_call_transcript import (
    get_agent_call_transcripts,
)


def build_transcript_text(
    db: Session,
    agent_call_id: int,
) -> str:
    transcripts = get_agent_call_transcripts(
        db,
        agent_call_id,
    )

    if not transcripts:
        return ""

    transcript_lines = []

    for transcript in transcripts:
        transcript_lines.append(
            f"{transcript.speaker}: "
            f"{transcript.message}"
        )

    return "\n".join(transcript_lines)


def analyze_call_transcript(
    transcript_text: str,
) -> Dict[str, str]:

    if not transcript_text:
        return {
            "summary": "No transcript available for analysis.",
            "key_points": "",
            "outcome": "No Transcript",
            "next_action": "Add call transcript",
        }

    text_lower = transcript_text.lower()

    outcome = "Completed"

    if any(
        word in text_lower
        for word in [
            "not interested",
            "no thanks",
            "don't call",
            "do not call",
        ]
    ):
        outcome = "Not Interested"

    elif any(
        word in text_lower
        for word in [
            "book",
            "meeting",
            "schedule",
            "demo",
            "appointment",
        ]
    ):
        outcome = "Follow-up Required"

    elif any(
        word in text_lower
        for word in [
            "buy",
            "purchase",
            "interested",
            "price",
            "pricing",
        ]
    ):
        outcome = "Interested"

    if outcome == "Interested":
        next_action = (
            "Contact the customer and continue "
            "the sales process."
        )

    elif outcome == "Follow-up Required":
        next_action = (
            "Schedule a follow-up with the customer."
        )

    elif outcome == "Not Interested":
        next_action = (
            "Mark the lead as not interested."
        )

    else:
        next_action = (
            "Review the call and determine the next step."
        )

    key_points = transcript_text[:1000]

    return {
        "summary": (
            "Call analysis completed successfully. "
            "The transcript was analyzed using the "
            "LeadVoix rule-based analysis engine."
        ),
        "key_points": key_points,
        "outcome": outcome,
        "next_action": next_action,
    }