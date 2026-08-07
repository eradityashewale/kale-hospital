import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import require_roles
from ..serializers import SETTINGS_DEFAULTS, settings_group_dict

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    values: dict


@router.get("/{group}")
def get_settings(group: str, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    if group not in SETTINGS_DEFAULTS:
        raise HTTPException(status_code=404, detail="Unknown settings group")
    return settings_group_dict(db, group)


@router.put("/{group}")
def update_settings(group: str, payload: SettingsUpdate, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    if group not in SETTINGS_DEFAULTS:
        raise HTTPException(status_code=404, detail="Unknown settings group")
    merged = {**settings_group_dict(db, group), **payload.values}
    row = db.query(models.Setting).filter(models.Setting.key == group).first()
    if not row:
        row = models.Setting(key=group, value="{}")
        db.add(row)
    row.value = json.dumps(merged)
    db.commit()
    log_audit(db, user.name, f"Updated {group} settings", "Settings")
    return merged
