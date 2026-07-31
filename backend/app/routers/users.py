from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db  # noqa: F401 (used via Depends)
from ..deps import require_roles
from ..ids import new_id
from ..security import hash_password
from ..serializers import user_dict

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreate(BaseModel):
    name: str
    email: str
    role: str
    password: str = "password"


@router.get("")
def list_users(user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    return [user_dict(u) for u in db.query(models.User).all()]


@router.post("")
def create_user(payload: UserCreate, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="A user with this email already exists")
    new_user = models.User(id=new_id("U"), name=payload.name, email=payload.email, role=payload.role, password_hash=hash_password(payload.password))
    db.add(new_user)
    db.commit()
    log_audit(db, user.name, f"Created user {payload.name} ({payload.role})", "Settings")
    return user_dict(new_user)


@router.delete("/{user_id}")
def deactivate_user(user_id: str, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(target)
    db.commit()
    log_audit(db, user.name, f"Deactivated user {target.name}", "Settings")
    return {"ok": True}
