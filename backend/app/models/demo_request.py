from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from backend.app.db.database import Base


class DemoRequest(Base):
    __tablename__ = "demo_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    email = Column(
        String,
        nullable=False,
        index=True,
    )

    company = Column(
        String,
        nullable=False,
    )

    phone = Column(
        String,
        nullable=True,
    )

    message = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="new",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )