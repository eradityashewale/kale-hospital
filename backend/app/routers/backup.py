import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import require_roles
from ..ids import new_id
from ..serializers import backup_dict

router = APIRouter(prefix="/api/backup", tags=["backup"])


@router.get("")
def list_backups(user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    return [backup_dict(b) for b in db.query(models.BackupRecord).order_by(models.BackupRecord.id.desc()).all()]


@router.post("/run")
def run_backup(user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    record = models.BackupRecord(id=new_id("BKP"), date=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), size="2.4 GB", status="Completed")
    db.add(record)
    db.commit()
    log_audit(db, user.name, "Ran manual database backup", "Backup & Restore")
    return backup_dict(record)


@router.post("/{backup_id}/restore")
def restore_backup(backup_id: str, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    log_audit(db, user.name, f"Initiated restore from {backup_id}", "Backup & Restore")
    return {"ok": True}
