from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..serializers import medicine_dict

router = APIRouter(prefix="/api/pharmacy", tags=["pharmacy"])


class MedicineCreate(BaseModel):
    name: str
    category: str = ""
    stock: int = 0
    unit: str = "units"
    expiry: str = ""
    supplier: str = ""
    price: float = 0
    reorder_level: int = 10


def _maybe_notify_low_stock(db: Session, medicine: models.Medicine) -> None:
    if medicine.stock > medicine.reorder_level:
        return
    existing = (
        db.query(models.Notification)
        .filter(
            models.Notification.type == "System",
            models.Notification.message.contains(medicine.name),
            models.Notification.message.contains("stock is low"),
            models.Notification.read.is_(False),
        )
        .first()
    )
    if existing:
        return
    db.add(models.Notification(
        id=new_id("N"), type="System",
        message=f"{medicine.name} stock is low ({medicine.stock} {medicine.unit} left, reorder level {medicine.reorder_level}).",
        recipient="Pharmacy team", status="Sent", time="Just now", read=False,
    ))
    db.commit()


@router.get("")
def list_medicines(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [medicine_dict(m) for m in db.query(models.Medicine).all()]


@router.post("")
def add_medicine(payload: MedicineCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    medicine = models.Medicine(id=new_id("MED"), **payload.model_dump())
    db.add(medicine)
    db.commit()
    log_audit(db, user.name, f"Added medicine {medicine.name}", "Pharmacy")
    _maybe_notify_low_stock(db, medicine)
    return medicine_dict(medicine)


@router.post("/{medicine_id}/issue")
def issue_medicine(medicine_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    if medicine.stock <= 0:
        raise HTTPException(status_code=400, detail=f"{medicine.name} is out of stock")
    medicine.stock -= 1
    db.commit()
    log_audit(db, user.name, f"Issued medicine {medicine.name}", "Pharmacy")
    _maybe_notify_low_stock(db, medicine)
    return medicine_dict(medicine)
