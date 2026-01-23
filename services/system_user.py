from models.user_model import User
from database import SessionLocal


def get_system_user():
    db = SessionLocal()
    user = db.query(User).first()

    if not user:
        user = User(email="demo@skinai.app", password_hash="demo")
        db.add(user)
        db.commit()
        db.refresh(user)

    db.close()
    return user
