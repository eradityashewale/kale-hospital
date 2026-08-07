import datetime
import json
import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import Base, SessionLocal, engine, get_db
from ..deps import require_roles
from ..ids import new_id
from ..serializers import backup_dict

router = APIRouter(prefix="/api/backup", tags=["backup"])

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backups")


def _json_default(value):
    if isinstance(value, (datetime.datetime, datetime.date)):
        return value.isoformat()
    return str(value)


def _format_size(num_bytes: int) -> str:
    if num_bytes >= 1024 * 1024:
        return f"{num_bytes / (1024 * 1024):.2f} MB"
    return f"{num_bytes / 1024:.1f} KB"


@router.get("")
def list_backups(user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    return [backup_dict(b) for b in db.query(models.BackupRecord).order_by(models.BackupRecord.id.desc()).all()]


@router.post("/run")
def run_backup(user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    os.makedirs(BACKUP_DIR, exist_ok=True)
    dump = {}
    with engine.connect() as conn:
        for table in Base.metadata.sorted_tables:
            rows = conn.execute(table.select()).mappings().all()
            dump[table.name] = [dict(r) for r in rows]

    filename = f"backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    path = os.path.join(BACKUP_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(dump, f, default=_json_default)
    size_label = _format_size(os.path.getsize(path))

    record = models.BackupRecord(
        id=new_id("BKP"), date=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        size=size_label, status="Completed", file_name=filename,
    )
    db.add(record)
    db.commit()
    log_audit(db, user.name, f"Ran full system backup ({size_label}, {len(dump)} tables)", "Backup & Restore")
    return backup_dict(record)


@router.post("/{backup_id}/restore")
def restore_backup(backup_id: str, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    record = db.query(models.BackupRecord).filter(models.BackupRecord.id == backup_id).first()
    if not record or not record.file_name:
        raise HTTPException(status_code=404, detail="Backup file not found")
    path = os.path.join(BACKUP_DIR, record.file_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Backup file is missing on disk")

    with open(path, "r", encoding="utf-8") as f:
        dump = json.load(f)

    user_name = user.name
    db.close()

    tables = Base.metadata.sorted_tables
    with engine.begin() as conn:
        for table in reversed(tables):
            conn.execute(table.delete())
        for table in tables:
            rows = dump.get(table.name, [])
            if rows:
                conn.execute(table.insert(), rows)

    fresh_db = SessionLocal()
    try:
        log_audit(fresh_db, user_name, f"Restored full system from backup {backup_id}", "Backup & Restore")
    finally:
        fresh_db.close()
    return {"ok": True}
