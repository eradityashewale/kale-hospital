from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user
from ..ids import new_id
from ..serializers import notification_dict

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationCreate(BaseModel):
    type: str
    recipient: str
    message: str


@router.get("")
def list_notifications(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [notification_dict(n) for n in db.query(models.Notification).order_by(models.Notification.created_at.desc()).all()]


@router.post("")
def send_notification(payload: NotificationCreate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = models.Notification(id=new_id("N"), type=payload.type, message=payload.message, recipient=payload.recipient, status="Sent", time="Just now", read=False)
    db.add(notif)
    db.commit()
    log_audit(db, user.name, f"Sent {payload.type} notification", "Notifications")
    return notification_dict(notif)


@router.patch("/{notification_id}/read")
def mark_read(notification_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    log_audit(db, user.name, f"Marked notification {notif.id} as read", "Notifications")
    return notification_dict(notif)


@router.patch("/read-all")
def mark_all_read(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(models.Notification).update({models.Notification.read: True})
    db.commit()
    log_audit(db, user.name, "Marked all notifications as read", "Notifications")
    return {"ok": True}
