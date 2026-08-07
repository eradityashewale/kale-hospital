from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user, require_roles
from ..ids import new_id
from ..serializers import vendor_dict

router = APIRouter(prefix="/api/vendors", tags=["vendors"])

MANAGERS = ("Super Admin", "Admin")


class VendorCreate(BaseModel):
    name: str
    category: str = "Pharmacy"
    contactPerson: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""


@router.get("")
def list_vendors(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [vendor_dict(v) for v in db.query(models.Vendor).all()]


@router.post("")
def create_vendor(payload: VendorCreate, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    vendor = models.Vendor(
        id=new_id("VEN"), name=payload.name, category=payload.category, contact_person=payload.contactPerson,
        phone=payload.phone, email=payload.email, address=payload.address, status="Active",
    )
    db.add(vendor)
    db.commit()
    log_audit(db, user.name, f"Added vendor {payload.name}", "Pharmacy")
    return vendor_dict(vendor)


@router.delete("/{vendor_id}")
def deactivate_vendor(vendor_id: str, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.status = "Inactive"
    db.commit()
    log_audit(db, user.name, f"Deactivated vendor {vendor.name}", "Pharmacy")
    return vendor_dict(vendor)
