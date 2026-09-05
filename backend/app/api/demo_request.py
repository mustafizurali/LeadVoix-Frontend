from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.schemas.demo_request import (
    DemoRequestCreate,
    DemoRequestResponse,
)
from backend.app.services.demo_request import create_demo_request


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