from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.schemas.dashboard import DashboardStatsResponse
from backend.app.services.dashboard import get_dashboard_stats

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
)
def dashboard_stats(
    db: Session = Depends(get_db),
):
    return get_dashboard_stats(db)