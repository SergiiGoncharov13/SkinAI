from pydantic import BaseModel


class DoctorVisitCreate(BaseModel):
    visit_date: str
    notes: str | None = None
    analysis_id: int | None = None
