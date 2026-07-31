from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import next_sequential_id
from ..serializers import admission_dict

router = APIRouter(prefix="/api/ipd", tags=["ipd"])


class AdmissionCreate(BaseModel):
    patientId: str
    ward: str
    room: str
    bed: str
    admissionDate: str
    doctor: str
    treatment: str = ""


class DischargeRequest(BaseModel):
    dischargeDate: str
    summary: str
    followUp: Optional[str] = None


@router.get("")
def list_admissions(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [admission_dict(a) for a in db.query(models.Admission).order_by(models.Admission.id.desc()).all()]


@router.post("")
def admit_patient(payload: AdmissionCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    existing_ids = [a.id for a in db.query(models.Admission.id).all()]
    admission = models.Admission(
        id=next_sequential_id("IPD", existing_ids, start=3000), patient_id=patient.id, patient_name=patient.name,
        ward=payload.ward, room=payload.room, bed=payload.bed, admission_date=payload.admissionDate,
        doctor=payload.doctor, treatment=payload.treatment, status="Admitted",
    )
    db.add(admission)
    patient.status = "IPD"
    patient.ward = payload.ward
    patient.room = payload.room
    patient.bed = payload.bed
    db.commit()
    log_audit(db, user.name, f"Admitted {patient.name} to {payload.ward}", "IPD")
    return admission_dict(admission)


@router.post("/{admission_id}/discharge")
def discharge_admission(admission_id: str, payload: DischargeRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    admission = db.query(models.Admission).filter(models.Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    admission.status = "Discharged"
    admission.discharge_date = payload.dischargeDate
    admission.discharge_summary = payload.summary
    patient = db.query(models.Patient).filter(models.Patient.id == admission.patient_id).first()
    if patient:
        patient.status = "Discharged"
    db.commit()
    log_audit(db, user.name, f"Discharged {admission.patient_name}", "IPD")
    return admission_dict(admission)
