from sqlalchemy.orm import Session

from backend.app.models.demo_request import DemoRequest
from backend.app.schemas.demo_request import (
    DemoRequestCreate,
)


def create_demo_request(
    db: Session,
    demo_request: DemoRequestCreate,
):
    db_demo_request = DemoRequest(
        name=demo_request.name,
        email=demo_request.email,
        company=demo_request.company,
        phone=demo_request.phone,
        message=demo_request.message,
        status="new",
    )

    db.add(db_demo_request)
    db.commit()
    db.refresh(db_demo_request)

    return db_demo_request


def get_demo_requests(
    db: Session,
):
    return (
        db.query(DemoRequest)
        .order_by(DemoRequest.created_at.desc())
        .all()
    )


def update_demo_request_status(
    db: Session,
    demo_request: DemoRequest,
    status: str,
):
    demo_request.status = status

    db.commit()
    db.refresh(demo_request)

    return demo_request