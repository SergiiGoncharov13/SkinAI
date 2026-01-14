from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from create_db import get_db
from models.history import History
from schemas.history_schema import HistoryCreate, HistoryResponse

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/", response_model=list[HistoryResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(History).order_by(History.created_at.desc()).all()


@router.post("/", response_model=HistoryResponse)
def create_history(data: HistoryCreate, db: Session = Depends(get_db)):
    item = History(**data.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
