from pydantic import BaseModel


class HistoryRead(BaseModel):
    id: int
    date_time: str
    result: str

    class Config:
        from_attributes = True
