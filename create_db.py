from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.base_model import Base
from models.user_model import User
from models.history_model import History


DATABASE_URL = "sqlite:///skinai.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database was created")
