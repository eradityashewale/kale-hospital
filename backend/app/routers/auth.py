from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..security import create_access_token, hash_password, verify_password
from ..serializers import user_dict

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class ProfileUpdate(BaseModel):
    name: str
    phone: str = ""


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user.id, user.role)
    log_audit(db, user.name, "Signed in", "Authentication")
    return {"token": token, "user": user_dict(user)}


@router.get("/me")
def me(user: models.User = Depends(get_current_user)):
    return user_dict(user)


@router.patch("/me")
def update_me(payload: ProfileUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.name = payload.name
    user.phone = payload.phone
    db.commit()
    log_audit(db, user.name, "Updated profile", "Profile")
    return user_dict(user)


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.currentPassword, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(payload.newPassword)
    db.commit()
    log_audit(db, user.name, "Changed account password", "Profile")
    return {"ok": True}


@router.post("/logout")
def logout(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit(db, user.name, "Signed out", "Authentication")
    return {"ok": True}
