import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..serializers import lab_dict, radiology_dict

router = APIRouter(prefix="/api", tags=["laboratory", "radiology"])


class LabTestCreate(BaseModel):
    patientId: str
    test: str
    doctor: str


class RadiologyCreate(BaseModel):
    patientId: str
    type: str
    doctor: str


class StatusUpdate(BaseModel):
    status: str


@router.get("/lab-tests")
def list_lab_tests(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [lab_dict(t) for t in db.query(models.LabTest).order_by(models.LabTest.id.desc()).all()]


@router.post("/lab-tests")
def book_lab_test(payload: LabTestCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    test = models.LabTest(id=new_id("LAB"), patient_id=patient.id, patient_name=patient.name, test=payload.test, doctor=payload.doctor, status="Booked", date=datetime.date.today().isoformat())
    db.add(test)
    db.commit()
    log_audit(db, user.name, f"Booked lab test {payload.test}", "Laboratory")
    return lab_dict(test)


@router.patch("/lab-tests/{test_id}/status")
def update_lab_status(test_id: str, payload: StatusUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(models.LabTest).filter(models.LabTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Lab test not found")
    test.status = payload.status
    db.commit()
    log_audit(db, user.name, f"Lab test {test.id} marked {payload.status}", "Laboratory")
    return lab_dict(test)


@router.get("/radiology-tests")
def list_radiology(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [radiology_dict(t) for t in db.query(models.RadiologyTest).order_by(models.RadiologyTest.id.desc()).all()]


@router.post("/radiology-tests")
def book_radiology(payload: RadiologyCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    test = models.RadiologyTest(id=new_id("RAD"), patient_id=patient.id, patient_name=patient.name, type=payload.type, doctor=payload.doctor, status="Pending", date=datetime.date.today().isoformat())
    db.add(test)
    db.commit()
    log_audit(db, user.name, f"Booked radiology scan {payload.type}", "Radiology")
    return radiology_dict(test)


@router.patch("/radiology-tests/{test_id}/status")
def update_radiology_status(test_id: str, payload: StatusUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(models.RadiologyTest).filter(models.RadiologyTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Radiology test not found")
    test.status = payload.status
    db.commit()
    log_audit(db, user.name, f"Radiology scan {test.id} marked {payload.status}", "Radiology")
    return radiology_dict(test)
