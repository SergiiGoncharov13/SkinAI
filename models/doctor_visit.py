from sqlalchemy import Column, Integer, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class DoctorVisit(Base):
    __tablename__ = "doctor_visits"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("history.id"), nullable=True)

    visit_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="doctor_visits")
    analysis = relationship("History", backref="doctor_visits")
