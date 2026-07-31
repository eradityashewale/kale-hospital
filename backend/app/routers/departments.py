from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..serializers import department_dict

router = APIRouter(prefix="/api/departments", tags=["departments"])


class DepartmentCreate(BaseModel):
    name: str
    head: str = ""


@router.get("")
def list_departments(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [department_dict(db, d) for d in db.query(models.Department).all()]


@router.post("")
def create_department(payload: DepartmentCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    dept = models.Department(id=new_id("DEP"), name=payload.name, head=payload.head)
    db.add(dept)
    db.commit()
    log_audit(db, user.name, f"Created department {payload.name}", "Settings")
    return department_dict(db, dept)
