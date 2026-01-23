from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_path = Column(String, nullable=False)

    prediction = Column(String, nullable=False)
    probabilities = Column(String, nullable=True)
    tag = Column(String, nullable=True)

    model_version = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

