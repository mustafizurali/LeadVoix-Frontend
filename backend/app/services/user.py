from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.models.organization import Organization

from backend.app.models.user import User
from backend.app.schemas.user import UserCreate
from backend.app.utils.security import (
    hash_password,
    verify_password,
)


def create_user(db: Session, user: UserCreate):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # Create user first
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="owner",
    )

    db.add(db_user)
    db.flush()

    # Create a personal organization for the new user
    db_organization = Organization(
        name=f"{user.name}'s Organization",
        slug=f"org-{db_user.id}",
        plan="free",
    )

    db.add(db_organization)
    db.flush()

    # Assign organization to user
    db_user.organization_id = db_organization.id

    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    result = verify_password(
        password,
        user.hashed_password,
    )

    if not result:
        return None

    return user