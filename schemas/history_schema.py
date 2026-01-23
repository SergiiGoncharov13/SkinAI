from pydantic import BaseModel
from datetime import datetime


class HistoryCreate(BaseModel):
    prediction: str
    probabilities: dict
    tag: str | None = None


class HistoryResponse(HistoryCreate):
    id: int
    created_at: datetime
