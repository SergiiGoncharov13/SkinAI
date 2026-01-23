import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.history import History
from create_db import get_db
from services.system_user import get_system_user

router = APIRouter()


@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    user = get_system_user()

    records = (
        db.query(History)
        .filter(History.user_id == user.id)
        .order_by(History.created_at.desc())
        .all()
    )

    return [serialize_history(r) for r in records]


def serialize_history(record):
    return {
        "id": record.id,
        "prediction": record.prediction,
        "probabilities": json.loads(record.probabilities),
        "tag": record.tag,
        "created_at": record.created_at
    }
