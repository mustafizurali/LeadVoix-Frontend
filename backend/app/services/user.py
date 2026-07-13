from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.schemas.user import UserCreate
from backend.app.utils.security import hash_password, verify_password


def create_user(db: Session, user: UserCreate):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="user"
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(db: Session, email: str, password: str):

    print("=" * 50)

    user = db.query(User).filter(User.email == email).first()


    if not user:
        print("USER NOT FOUND")
        return None


    result = verify_password(password, user.hashed_password)



    if not result:
        return None

    return user