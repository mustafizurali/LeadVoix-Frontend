from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=True
    )

    organization = relationship(
        "Organization",
        back_populates="users"
    )
    
    deals = relationship(
    "Deal",
    back_populates="owner",
    )
    hashed_password = Column(String, nullable=False)

    role = Column(
        String,
        nullable=False,
        default="user"
    )