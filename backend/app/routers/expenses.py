import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import require_roles
from ..ids import new_id
from ..serializers import expense_dict

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

MANAGERS = ("Super Admin", "Admin")
CATEGORIES = ("Pantry", "Equipment", "Pharmacy Restock", "Maintenance", "Other")


class ExpenseCreate(BaseModel):
    category: str
    amount: float
    date: str = ""
    description: str = ""


@router.get("")
def list_expenses(user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    return [
        expense_dict(e)
        for e in db.query(models.Expense).order_by(models.Expense.date.desc(), models.Expense.id.desc()).all()
    ]


@router.post("")
def create_expense(payload: ExpenseCreate, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    if payload.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {', '.join(CATEGORIES)}")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    record = models.Expense(
        id=new_id("EXP"), category=payload.category, description=payload.description,
        amount=payload.amount, date=payload.date or datetime.date.today().isoformat(), recorded_by=user.name,
    )
    db.add(record)
    db.commit()
    log_audit(db, user.name, f"Logged {payload.category} expense of {payload.amount}", "Expenses")
    return expense_dict(record)


@router.delete("/{expense_id}")
def delete_expense(expense_id: str, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    record = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(record)
    db.commit()
    log_audit(db, user.name, f"Deleted {record.category} expense of {record.amount}", "Expenses")
    return {"ok": True}
