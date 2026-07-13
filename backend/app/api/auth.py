from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
)
from backend.app.services.user import (
    create_user,
    authenticate_user,
)
from backend.app.utils.security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(db, user)


@router.post(
    "/login",
    response_model=Token,
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):

    db_user = authenticate_user(
        db,
        user.email,
        user.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }