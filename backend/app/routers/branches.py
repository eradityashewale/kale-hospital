from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user, require_roles
from ..ids import new_id
from ..serializers import branch_dict

router = APIRouter(prefix="/api/branches", tags=["branches"])


class BranchCreate(BaseModel):
    name: str
    location: str = ""
    beds: int = 0
    staff: int = 0


@router.get("")
def list_branches(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [branch_dict(b) for b in db.query(models.Branch).all()]


@router.post("")
def create_branch(payload: BranchCreate, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    branch = models.Branch(id=new_id("BR"), name=payload.name, location=payload.location, beds=payload.beds, staff=payload.staff, status="Active")
    db.add(branch)
    db.commit()
    log_audit(db, user.name, f"Added branch {payload.name}", "Settings")
    return branch_dict(branch)
