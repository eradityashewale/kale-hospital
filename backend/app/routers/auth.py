import datetime
import secrets

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..security import create_2fa_challenge, create_access_token, decode_access_token, hash_password, verify_password
from ..serializers import user_dict
from ..totp import generate_secret, otpauth_uri, verify_totp

router = APIRouter(prefix="/api/auth", tags=["auth"])

RESET_TOKEN_MINUTES = 30


class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class ProfileUpdate(BaseModel):
    name: str
    phone: str = ""


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str


class TwoFactorLoginRequest(BaseModel):
    challengeToken: str
    code: str


class TwoFactorCodeRequest(BaseModel):
    code: str


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user.totp_enabled:
        return {"requiresTwoFactor": True, "challengeToken": create_2fa_challenge(user.id)}
    token = create_access_token(user.id, user.role)
    log_audit(db, user.name, "Signed in", "Authentication")
    return {"token": token, "user": user_dict(user)}


@router.post("/login/2fa")
def login_2fa(payload: TwoFactorLoginRequest, db: Session = Depends(get_db)):
    try:
        claims = decode_access_token(payload.challengeToken)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Your session expired, please log in again")
    if claims.get("purpose") != "2fa":
        raise HTTPException(status_code=401, detail="Invalid session, please log in again")
    user = db.query(models.User).filter(models.User.id == claims.get("sub")).first()
    if not user or not user.totp_enabled or not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid or expired authentication code")
    token = create_access_token(user.id, user.role)
    log_audit(db, user.name, "Signed in with two-factor authentication", "Authentication")
    return {"token": token, "user": user_dict(user)}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user:
        token = secrets.token_urlsafe(24)
        expires = (datetime.datetime.utcnow() + datetime.timedelta(minutes=RESET_TOKEN_MINUTES)).isoformat()
        user.reset_token = token
        user.reset_token_expires = expires
        db.add(models.Notification(
            id=new_id("N"), type="System",
            message=f"Password reset requested for {user.name} ({user.email}). Reset code: {token} (valid {RESET_TOKEN_MINUTES} min).",
            recipient="Super Admin", status="Sent", time="Just now", read=False,
        ))
        db.commit()
        log_audit(db, user.name, "Requested a password reset", "Authentication")
    return {"message": "If that email exists, a reset code has been generated and sent to the admin team."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.reset_token == payload.token).first()
    expired = not user or not user.reset_token_expires or datetime.datetime.utcnow() > datetime.datetime.fromisoformat(user.reset_token_expires)
    if expired:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    user.password_hash = hash_password(payload.newPassword)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    log_audit(db, user.name, "Reset password using a reset code", "Authentication")
    return {"ok": True}


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


@router.post("/2fa/setup")
def setup_2fa(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = generate_secret()
    user.totp_secret = secret
    user.totp_enabled = False
    db.commit()
    return {"secret": secret, "otpauthUrl": otpauth_uri(secret, user.email)}


@router.post("/2fa/verify")
def verify_2fa(payload: TwoFactorCodeRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.totp_secret or not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")
    user.totp_enabled = True
    db.commit()
    log_audit(db, user.name, "Enabled two-factor authentication", "Profile")
    return user_dict(user)


@router.post("/2fa/disable")
def disable_2fa(payload: TwoFactorCodeRequest, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.totp_enabled or not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")
    user.totp_enabled = False
    user.totp_secret = None
    db.commit()
    log_audit(db, user.name, "Disabled two-factor authentication", "Profile")
    return user_dict(user)
