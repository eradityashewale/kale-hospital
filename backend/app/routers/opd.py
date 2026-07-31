from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import next_sequential_id
from ..serializers import opd_dict

router = APIRouter(prefix="/api/opd", tags=["opd"])


class OpdCreate(BaseModel):
    patientId: str
    department: str
    doctor: str
    fee: float = 0
    symptoms: str = ""
    diagnosis: str = ""
    prescription: str = ""
    followUp: str = ""
    date: str = ""


@router.get("")
def list_opd(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [opd_dict(v) for v in db.query(models.OpdVisit).order_by(models.OpdVisit.id.desc()).all()]


@router.post("")
def create_opd_visit(payload: OpdCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    existing_ids = [v.id for v in db.query(models.OpdVisit.id).all()]
    visit = models.OpdVisit(
        id=next_sequential_id("OPD", existing_ids, start=5000), patient_id=patient.id, patient_name=patient.name,
        doctor=payload.doctor, department=payload.department, fee=payload.fee, symptoms=payload.symptoms,
        diagnosis=payload.diagnosis, prescription=payload.prescription, follow_up=payload.followUp or "—", date=payload.date,
    )
    db.add(visit)
    db.add(models.PatientVisit(patient_id=patient.id, date=payload.date, type="OPD", doctor=payload.doctor, diagnosis=payload.diagnosis))
    if payload.prescription and payload.prescription != "—":
        db.add(models.Prescription(patient_id=patient.id, date=payload.date, doctor=payload.doctor, medicines=payload.prescription, follow_up=payload.followUp or "—"))
    if patient.status not in ("IPD", "Critical"):
        patient.status = "OPD"
    db.commit()
    log_audit(db, user.name, f"Recorded OPD visit {visit.id}", "OPD")
    return opd_dict(visit)
