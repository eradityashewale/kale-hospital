import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..serializers import emergency_dict

router = APIRouter(prefix="/api/emergency", tags=["emergency"])


class EmergencyCreate(BaseModel):
    patient: str
    condition: str = "Serious"
    doctor: str
    ambulance: str = "No"
    triage: str = ""
    notes: str = ""


@router.get("")
def list_emergency(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [emergency_dict(e) for e in db.query(models.EmergencyCase).order_by(models.EmergencyCase.id.desc()).all()]


@router.post("")
def register_emergency(payload: EmergencyCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    case = models.EmergencyCase(
        id=new_id("ER"), patient_name=payload.patient, condition=payload.condition, doctor=payload.doctor,
        ambulance=payload.ambulance, triage=payload.triage, arrival=datetime.datetime.now().strftime("%H:%M"),
        notes=payload.notes or "—",
    )
    db.add(case)
    db.commit()
    log_audit(db, user.name, f"Registered emergency case for {payload.patient}", "Emergency")
    return emergency_dict(case)
