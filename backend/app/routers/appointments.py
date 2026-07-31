from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..serializers import appointment_dict

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


class AppointmentCreate(BaseModel):
    patientId: str
    department: str
    doctor: str
    date: str
    time: str


class StatusUpdate(BaseModel):
    status: str


def _next_token(db: Session) -> str:
    tokens = [a.token for a in db.query(models.Appointment.token).all()]
    nums = []
    for t in tokens:
        try:
            nums.append(int(str(t).replace("T-", "")))
        except ValueError:
            continue
    return f"T-{(max(nums) + 1 if nums else 1):02d}"


@router.get("")
def list_appointments(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [appointment_dict(a) for a in db.query(models.Appointment).order_by(models.Appointment.id.desc()).all()]


@router.post("")
def book_appointment(payload: AppointmentCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    appt = models.Appointment(
        id=new_id("APT"), patient_id=patient.id, patient_name=patient.name, department=payload.department,
        doctor=payload.doctor, date=payload.date, time=payload.time, token=_next_token(db), status="Pending",
    )
    db.add(appt)
    db.commit()
    log_audit(db, user.name, f"Booked appointment for {patient.name}", "Appointments")
    return appointment_dict(appt)


@router.patch("/{appointment_id}/status")
def update_status(appointment_id: str, payload: StatusUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = payload.status
    db.commit()
    log_audit(db, user.name, f"Marked appointment {appt.token} as {payload.status}", "Appointments")
    return appointment_dict(appt)
