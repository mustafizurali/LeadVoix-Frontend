from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.db.database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String, nullable=False)

    last_name = Column(String, nullable=True)

    email = Column(String, nullable=True)

    phone = Column(String, nullable=True)

    company = Column(String, nullable=True)

    status = Column(
        String,
        nullable=False,
        default="new"
    )

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False
    )

    organization = relationship(
        "Organization",
        back_populates="contacts"
    )



    deals = relationship(
    "Deal",
    back_populates="contact",
    )