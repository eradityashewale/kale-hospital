import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..serializers import referral_dict

router = APIRouter(prefix="/api/referrals", tags=["referrals"])


class ReferralCreate(BaseModel):
    patientId: str
    department: str
    reason: str


@router.get("")
def list_referrals(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [referral_dict(r) for r in db.query(models.Referral).order_by(models.Referral.id.desc()).all()]


@router.post("")
def create_referral(payload: ReferralCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    today = datetime.date.today().isoformat()
    referral = models.Referral(
        id=new_id("REF"), patient_id=patient.id, patient_name=patient.name, from_department=patient.department,
        to_department=payload.department, doctor=patient.doctor, reason=payload.reason, status="Pending",
        date=today, referred_by=user.name,
    )
    db.add(referral)
    db.add(models.PatientVisit(
        patient_id=patient.id, date=today, type="Referral", doctor=user.name,
        diagnosis=f"Referred to {payload.department}: {payload.reason}",
    ))
    db.commit()
    log_audit(db, user.name, f"Referred {patient.name} to {payload.department}", "Patients")
    return referral_dict(referral)
