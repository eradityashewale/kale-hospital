import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user, require_roles
from ..ids import new_id
from ..serializers import DEFAULT_LEAVE_ALLOCATIONS, LEAVE_TYPES, leave_balance_dict_for, leave_dict

router = APIRouter(prefix="/api/leave", tags=["leave"])

APPROVERS = ("Super Admin", "Admin")


def _now() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _leave_days(start_date: str, end_date: str) -> int:
    start = datetime.date.fromisoformat(start_date)
    end = datetime.date.fromisoformat(end_date)
    return (end - start).days + 1


def _get_or_create_balance(db: Session, user_id: str, leave_type: str) -> models.LeaveBalance:
    balance = (
        db.query(models.LeaveBalance)
        .filter(models.LeaveBalance.user_id == user_id, models.LeaveBalance.leave_type == leave_type)
        .first()
    )
    if not balance:
        balance = models.LeaveBalance(
            user_id=user_id, leave_type=leave_type, allocated=DEFAULT_LEAVE_ALLOCATIONS[leave_type], used=0,
        )
        db.add(balance)
        db.commit()
    return balance


class LeaveCreate(BaseModel):
    leave_type: str
    start_date: str
    end_date: str
    reason: str = ""


class LeaveReview(BaseModel):
    status: str
    review_note: str = ""


class BalanceUpdate(BaseModel):
    allocated: int


@router.post("")
def create_leave(payload: LeaveCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role in APPROVERS:
        raise HTTPException(status_code=403, detail="Admins review leave requests and do not apply for leave themselves")
    if payload.leave_type not in LEAVE_TYPES:
        raise HTTPException(status_code=400, detail=f"Leave type must be one of: {', '.join(LEAVE_TYPES)}")
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="End date cannot be before start date")

    days = _leave_days(payload.start_date, payload.end_date)
    remaining = leave_balance_dict_for(db, user, payload.leave_type)["remaining"]
    if days > remaining:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient {payload.leave_type} leave balance: {remaining} day(s) remaining",
        )

    record = models.LeaveRequest(
        id=new_id("LV"), user_id=user.id, requester_name=user.name, role=user.role,
        leave_type=payload.leave_type, start_date=payload.start_date, end_date=payload.end_date,
        reason=payload.reason, status="Pending", applied_at=_now(),
    )
    db.add(record)
    db.commit()
    log_audit(db, user.name, f"Applied for {payload.leave_type} leave ({payload.start_date} to {payload.end_date})", "Leave")
    return leave_dict(record)


@router.get("")
def list_leave(status: str | None = None, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.LeaveRequest)
    if user.role not in APPROVERS:
        query = query.filter(models.LeaveRequest.user_id == user.id)
    if status:
        query = query.filter(models.LeaveRequest.status == status)
    return [leave_dict(l) for l in query.order_by(models.LeaveRequest.applied_at.desc()).all()]


@router.get("/balances/me")
def my_balances(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [leave_balance_dict_for(db, user, lt) for lt in LEAVE_TYPES]


@router.get("/balances")
def list_balances(admin: models.User = Depends(require_roles(*APPROVERS)), db: Session = Depends(get_db)):
    return [
        leave_balance_dict_for(db, u, lt)
        for u in db.query(models.User).filter(~models.User.role.in_(APPROVERS)).all()
        for lt in LEAVE_TYPES
    ]


@router.patch("/balances/{user_id}/{leave_type}")
def update_balance(
    user_id: str, leave_type: str, payload: BalanceUpdate,
    admin: models.User = Depends(require_roles(*APPROVERS)), db: Session = Depends(get_db),
):
    if leave_type not in LEAVE_TYPES:
        raise HTTPException(status_code=400, detail=f"Leave type must be one of: {', '.join(LEAVE_TYPES)}")
    if payload.allocated < 0:
        raise HTTPException(status_code=400, detail="Allocated days cannot be negative")
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role in APPROVERS:
        raise HTTPException(status_code=400, detail="Super Admin and Admin do not need leave balances")

    balance = _get_or_create_balance(db, user_id, leave_type)
    balance.allocated = payload.allocated
    db.commit()
    log_audit(db, admin.name, f"Set {target.name}'s {leave_type} leave balance to {payload.allocated} day(s)", "Leave")
    return leave_balance_dict_for(db, target, leave_type)


@router.patch("/{leave_id}")
def review_leave(leave_id: str, payload: LeaveReview, user: models.User = Depends(require_roles(*APPROVERS)), db: Session = Depends(get_db)):
    if payload.status not in ("Approved", "Rejected"):
        raise HTTPException(status_code=400, detail="Status must be Approved or Rejected")
    record = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if record.status != "Pending":
        raise HTTPException(status_code=400, detail=f"This leave request has already been {record.status.lower()}")

    if payload.status == "Approved":
        balance = _get_or_create_balance(db, record.user_id, record.leave_type)
        balance.used += _leave_days(record.start_date, record.end_date)

    record.status = payload.status
    record.reviewed_by = user.name
    record.reviewed_at = _now()
    record.review_note = payload.review_note
    db.commit()
    log_audit(db, user.name, f"{payload.status} leave request for {record.requester_name}", "Leave")
    return leave_dict(record)


@router.delete("/{leave_id}")
def cancel_leave(leave_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if record.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own leave request")
    if record.status != "Pending":
        raise HTTPException(status_code=400, detail="Only pending leave requests can be cancelled")
    db.delete(record)
    db.commit()
    log_audit(db, user.name, "Cancelled leave request", "Leave")
    return {"ok": True}
