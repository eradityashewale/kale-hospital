import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import next_sequential_id
from ..serializers import bill_dict, claim_dict

router = APIRouter(prefix="/api", tags=["billing", "insurance"])


class BillCreate(BaseModel):
    patientId: str
    mode: str = "Cash"
    consultation: float = 0
    room: float = 0
    operation: float = 0
    medicine: float = 0
    lab: float = 0
    radiology: float = 0
    discount: float = 0
    gst: float = 18


class ClaimStatusUpdate(BaseModel):
    status: str


def _compute_total(payload: BillCreate) -> float:
    subtotal = payload.consultation + payload.room + payload.operation + payload.medicine + payload.lab + payload.radiology
    discount = subtotal * (payload.discount / 100)
    gst = (subtotal - discount) * (payload.gst / 100)
    return round(subtotal - discount + gst)


@router.get("/bills")
def list_bills(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [bill_dict(b) for b in db.query(models.Bill).order_by(models.Bill.id.desc()).all()]


@router.post("/bills")
def create_bill(payload: BillCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == payload.patientId).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    existing_ids = [b.id for b in db.query(models.Bill.id).all()]
    bill = models.Bill(
        id=next_sequential_id("INV", existing_ids, start=200), patient_id=patient.id, patient_name=patient.name,
        amount=_compute_total(payload), status="Pending", date=datetime.date.today().isoformat(), mode=payload.mode,
    )
    db.add(bill)
    db.commit()
    log_audit(db, user.name, f"Generated invoice {bill.id}", "Billing")
    return bill_dict(bill)


@router.post("/bills/{bill_id}/mark-paid")
def mark_paid(bill_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Invoice not found")
    bill.status = "Paid"
    db.commit()
    log_audit(db, user.name, f"Marked invoice {bill.id} as paid", "Billing")
    return bill_dict(bill)


@router.get("/insurance-claims")
def list_claims(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [claim_dict(c) for c in db.query(models.InsuranceClaim).all()]


@router.patch("/insurance-claims/{claim_id}/status")
def update_claim_status(claim_id: str, payload: ClaimStatusUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    claim = db.query(models.InsuranceClaim).filter(models.InsuranceClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = payload.status
    if payload.status == "Approved":
        claim.approved = claim.claimed
        claim.pending = 0
    elif payload.status == "Rejected":
        claim.approved = 0
        claim.pending = 0
    db.commit()
    log_audit(db, user.name, f"{payload.status} insurance claim for {claim.patient_name}", "Insurance")
    return claim_dict(claim)
