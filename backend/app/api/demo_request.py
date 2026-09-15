from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.demo_request import DemoRequest
from backend.app.schemas.demo_request import (
    DemoRequestCreate,
    DemoRequestResponse,
)
from backend.app.services.demo_request import (
    create_demo_request,
    get_demo_requests,
    update_demo_request_status,
)


router = APIRouter(
    prefix="/demo-requests",
    tags=["Demo Requests"],
)


@router.post(
    "/",
    response_model=DemoRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_demo_request(
    demo_request: DemoRequestCreate,
    db: Session = Depends(get_db),
):
    return create_demo_request(
        db=db,
        demo_request=demo_request,
    )


@router.get(
    "/",
    response_model=List[DemoRequestResponse],
)
def list_demo_requests(
    db: Session = Depends(get_db),
):
    return get_demo_requests(db=db)


@router.put(
    "/{demo_request_id}/status",
    response_model=DemoRequestResponse,
)
def update_status(
    demo_request_id: int,
    new_status: str,
    db: Session = Depends(get_db),
):
    demo_request = (
        db.query(DemoRequest)
        .filter(DemoRequest.id == demo_request_id)
        .first()
    )

    if not demo_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo request not found",
        )

    allowed_statuses = {
        "new",
        "contacted",
        "qualified",
        "converted",
        "closed",
    }

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid demo request status",
        )

    return update_demo_request_status(
        db=db,
        demo_request=demo_request,
        status=new_status,
    )