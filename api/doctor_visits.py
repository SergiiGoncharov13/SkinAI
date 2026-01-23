from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from models.doctor_visit import DoctorVisit
from schemas.doctor_visit import DoctorVisitCreate
from create_db import get_db
from services.system_user import get_system_user

router = APIRouter()


def serialize_visit(visit: DoctorVisit):
    return {
        "id": visit.id,
        "visit_date": visit.visit_date,
        "notes": visit.notes,
        "analysis_id": visit.analysis_id,
        "created_at": visit.created_at,
    }


@router.get("/doctor-visits")
def get_doctor_visits(db: Session = Depends(get_db)):
    user = get_system_user()

    visits = (
        db.query(DoctorVisit)
        .filter(DoctorVisit.user_id == user.id)
        .order_by(DoctorVisit.visit_date.desc())
        .all()
    )

    return [serialize_visit(v) for v in visits]


@router.post("/doctor-visits")
def create_doctor_visit(
    payload: DoctorVisitCreate,
    db: Session = Depends(get_db),
):
    user = get_system_user()

    visit = DoctorVisit(
        user_id=user.id,
        analysis_id=payload.analysis_id,
        visit_date=datetime.fromisoformat(payload.visit_date),
        notes=payload.notes,
    )

    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit
