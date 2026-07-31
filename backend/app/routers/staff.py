import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import config, models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..geo import haversine_meters
from ..ids import new_id
from ..serializers import attendance_dict, doctor_dict, lab_tech_dict, nurse_dict, pharmacist_dict, receptionist_dict

router = APIRouter(prefix="/api/staff", tags=["staff"])

STAFF_ROSTER_MODELS = (models.Doctor, models.Nurse, models.Receptionist, models.LabTechnician, models.Pharmacist)


def _today() -> str:
    return datetime.date.today().isoformat()


def _now_hhmm() -> str:
    return datetime.datetime.now().strftime("%H:%M")


def _shift_for(db: Session, name: str) -> str:
    """Each staff member has one fixed shift on their roster record (set when they were added).
    Morning/Evening/Night staff are different people, so we just look theirs up rather than ask."""
    for roster_model in STAFF_ROSTER_MODELS:
        record = db.query(roster_model).filter(roster_model.name == name).first()
        if record:
            return record.shift or "General"
    return "General"


ROLE_LABELS = {"doctors": "Doctor", "nurses": "Nurse", "receptionists": "Receptionist", "labTechs": "Lab Technician", "pharmacists": "Pharmacist"}


class StaffCreate(BaseModel):
    name: str
    department: str = ""
    specialization: str = ""
    shift: str = "Morning"
    phone: str = ""


class CheckInPayload(BaseModel):
    lat: float
    lon: float
    accuracy: float | None = None


@router.get("/doctors")
def list_doctors(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [doctor_dict(d) for d in db.query(models.Doctor).all()]


@router.get("/nurses")
def list_nurses(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [nurse_dict(n) for n in db.query(models.Nurse).all()]


@router.get("/receptionists")
def list_receptionists(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [receptionist_dict(r) for r in db.query(models.Receptionist).all()]


@router.get("/lab-technicians")
def list_lab_techs(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [lab_tech_dict(t) for t in db.query(models.LabTechnician).all()]


@router.get("/pharmacists")
def list_pharmacists(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [pharmacist_dict(p) for p in db.query(models.Pharmacist).all()]


@router.get("/attendance")
def list_attendance(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [attendance_dict(a) for a in db.query(models.Attendance).all()]


@router.post("/attendance/check-in")
def check_in(payload: CheckInPayload, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    distance = haversine_meters(payload.lat, payload.lon, config.HOSPITAL_LAT, config.HOSPITAL_LON)
    if distance > config.HOSPITAL_CHECKIN_RADIUS_METERS:
        raise HTTPException(
            status_code=400,
            detail=f"You're about {int(distance)}m from the hospital. Check-in only works within {int(config.HOSPITAL_CHECKIN_RADIUS_METERS)}m of the premises.",
        )

    today = _today()
    record = db.query(models.Attendance).filter(models.Attendance.staff == user.name, models.Attendance.date == today).first()
    if record and record.check_in and record.check_in != "—":
        raise HTTPException(status_code=400, detail="You're already checked in today")

    shift = _shift_for(db, user.name)
    if not record:
        record = models.Attendance(staff=user.name, role=user.role, date=today, shift=shift, status="Present", check_in=_now_hhmm(), check_out="—")
        db.add(record)
    else:
        record.shift = shift
        record.status = "Present"
        record.check_in = _now_hhmm()
        record.check_out = "—"

    db.commit()
    db.refresh(record)
    log_audit(db, user.name, f"Checked in for {shift} shift", "Staff")
    return attendance_dict(record)


@router.post("/attendance/check-out")
def check_out(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = _today()
    record = db.query(models.Attendance).filter(models.Attendance.staff == user.name, models.Attendance.date == today).first()
    if not record or not record.check_in or record.check_in == "—":
        raise HTTPException(status_code=400, detail="You haven't checked in today")
    if record.check_out and record.check_out != "—":
        raise HTTPException(status_code=400, detail="You're already checked out today")

    record.check_out = _now_hhmm()
    db.commit()
    db.refresh(record)
    log_audit(db, user.name, "Checked out for the day", "Staff")
    return attendance_dict(record)


@router.post("/{role}")
def add_staff(role: str, payload: StaffCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if role not in ROLE_LABELS:
        raise HTTPException(status_code=400, detail="Unknown staff category")

    if role == "doctors":
        record = models.Doctor(id=new_id("DOC"), name=payload.name, department=payload.department, specialization=payload.specialization, status="Available", experience="0 yrs", phone=payload.phone, shift=payload.shift)
        out = doctor_dict(record)
    elif role == "nurses":
        record = models.Nurse(id=new_id("NUR"), name=payload.name, ward="Unassigned", shift=payload.shift, status="On Duty", phone=payload.phone)
        out = nurse_dict(record)
    elif role == "receptionists":
        record = models.Receptionist(id=new_id("REC"), name=payload.name, desk="Front Desk", shift=payload.shift, status="On Duty", phone=payload.phone)
        out = receptionist_dict(record)
    elif role == "labTechs":
        record = models.LabTechnician(id=new_id("LABT"), name=payload.name, dept="Pathology", shift=payload.shift, status="On Duty", phone=payload.phone)
        out = lab_tech_dict(record)
    else:
        record = models.Pharmacist(id=new_id("PHM"), name=payload.name, dept="Pharmacy", shift=payload.shift, status="On Duty", phone=payload.phone)
        out = pharmacist_dict(record)

    db.add(record)
    db.commit()
    log_audit(db, user.name, f"Added staff member {payload.name} ({ROLE_LABELS[role]})", "Staff")
    return out
