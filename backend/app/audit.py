import datetime
import random

from sqlalchemy.orm import Session

from . import models
from .ids import new_id


def log_audit(db: Session, user: str, action: str, module: str) -> None:
    entry = models.AuditLog(
        id=new_id("AUD"),
        user=user,
        action=action,
        module=module,
        timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        ip=f"10.0.0.{random.randint(2, 250)}",
    )
    db.add(entry)
    db.commit()
