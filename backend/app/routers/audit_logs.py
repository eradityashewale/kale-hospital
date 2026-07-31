from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..deps import require_roles
from ..serializers import audit_dict

router = APIRouter(prefix="/api/audit-logs", tags=["audit"])


@router.get("")
def list_audit_logs(user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    return [audit_dict(a) for a in db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).all()]
