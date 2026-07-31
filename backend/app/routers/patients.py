import datetime
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import next_sequential_id
from ..serializers import patient_full_dict

router = APIRouter(prefix="/api/patients", tags=["patients"])


class PatientCreate(BaseModel):
    name: str
    gender: str = ""
    dob: str = ""
    mobile: str = ""
    altMobile: str = ""
    email: str = ""
    address: str = ""
    bloodGroup: str = ""
    aadhaar: str = ""
    emergencyContact: str = ""
    insuranceProvider: str = "None"
    policyNo: str = "—"
    allergies: str = ""
    diseases: str = ""
    department: str = ""
    doctor: str = ""
    photo: Optional[str] = None


class VitalsUpdate(BaseModel):
    bp: str = ""
    temp: str = ""
    spo2: str = ""
    sugar: str = ""
    pulse: str = ""
    weight: str = ""
    notes: str = ""


class PrescriptionCreate(BaseModel):
    diagnosis: str
    medicines: str
    followUp: str = "—"


@router.get("")
def list_patients(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patients = db.query(models.Patient).order_by(models.Patient.created_at.desc()).all()
    return [patient_full_dict(db, p) for p in patients]


@router.get("/{patient_id}")
def get_patient(patient_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient_full_dict(db, patient)


@router.post("")
def register_patient(payload: PatientCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_ids = [p.id for p in db.query(models.Patient.id).all()]
    new_id = next_sequential_id("PAT", existing_ids, start=1000)
    aadhaar_masked = f"•••• •••• {payload.aadhaar[-4:]}" if payload.aadhaar else "—"

    patient = models.Patient(
        id=new_id, name=payload.name, gender=payload.gender, dob=payload.dob, mobile=payload.mobile,
        alt_mobile=payload.altMobile, email=payload.email, address=payload.address, blood_group=payload.bloodGroup,
        aadhaar=aadhaar_masked, emergency_contact=payload.emergencyContact or "—",
        insurance_provider=payload.insuranceProvider or "None", insurance_policy_no=payload.policyNo or "—",
        insurance_coverage="Pending verification" if payload.insuranceProvider not in (None, "", "None") else "—",
        allergies=payload.allergies, diseases=payload.diseases, department=payload.department, doctor=payload.doctor,
        status="OPD", photo=payload.photo,
    )
    db.add(patient)
    db.flush()
    db.add(models.PatientVisit(patient_id=patient.id, date=datetime.date.today().isoformat(), type="Registration", doctor=payload.doctor, diagnosis="New patient registration"))
    db.commit()
    log_audit(db, user.name, f"Registered new patient {patient.id}", "Patients")
    return patient_full_dict(db, patient)


@router.post("/{patient_id}/prescriptions")
def add_prescription(patient_id: str, payload: PrescriptionCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    today = datetime.date.today().isoformat()
    db.add(models.Prescription(patient_id=patient.id, date=today, doctor=user.name, medicines=payload.medicines, follow_up=payload.followUp or "—"))
    db.add(models.PatientVisit(patient_id=patient.id, date=today, type="Prescription", doctor=user.name, diagnosis=payload.diagnosis))
    db.commit()
    log_audit(db, user.name, f"Wrote prescription for {patient.name}", "OPD")
    return patient_full_dict(db, patient)


@router.patch("/{patient_id}/vitals")
def update_vitals(patient_id: str, payload: VitalsUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.vitals = json.dumps(payload.model_dump())
    db.commit()
    log_audit(db, user.name, f"Updated vitals for {patient.name}", "Nursing")
    return patient_full_dict(db, patient)
