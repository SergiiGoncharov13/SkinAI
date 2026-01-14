from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from database import Base


class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True)
    prediction = Column(String, nullable=False)
    probabilities = Column(JSON, nullable=False)
    tag = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
