from sqlalchemy import Column, Integer, Text

from .base_model import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text)
    email = Column(Text)
    password = Column(Text)
