from typing import Optional

from sqlalchemy.orm import Session

from backend.app.models.agent_call_summary import (
    AgentCallSummary,
)
from backend.app.schemas.agent_call_summary import (
    AgentCallSummaryCreate,
    AgentCallSummaryUpdate,
)


def create_agent_call_summary(
    db: Session,
    agent_call_id: int,
    summary_data: AgentCallSummaryCreate,
) -> AgentCallSummary:
    summary = AgentCallSummary(
        agent_call_id=agent_call_id,
        summary=summary_data.summary,
        key_points=summary_data.key_points,
        outcome=summary_data.outcome,
        next_action=summary_data.next_action,
    )

    db.add(summary)
    db.commit()
    db.refresh(summary)

    return summary


def get_agent_call_summary(
    db: Session,
    agent_call_id: int,
) -> Optional[AgentCallSummary]:
    return (
        db.query(AgentCallSummary)
        .filter(
            AgentCallSummary.agent_call_id == agent_call_id
        )
        .first()
    )


def update_agent_call_summary(
    db: Session,
    summary: AgentCallSummary,
    summary_data: AgentCallSummaryUpdate,
) -> AgentCallSummary:
    update_data = summary_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(
            summary,
            field,
            value,
        )

    db.commit()
    db.refresh(summary)

    return summary


def delete_agent_call_summary(
    db: Session,
    summary: AgentCallSummary,
) -> None:
    db.delete(summary)
    db.commit()