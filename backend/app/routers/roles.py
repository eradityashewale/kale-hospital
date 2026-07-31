from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import require_roles
from ..serializers import role_permissions_dict

router = APIRouter(prefix="/api/roles", tags=["roles"])


class PermissionUpdate(BaseModel):
    role: str
    module: str
    key: str
    value: bool


@router.get("")
def list_permissions(user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    return role_permissions_dict(db.query(models.RolePermission).all())


@router.patch("")
def update_permission(payload: PermissionUpdate, user: models.User = Depends(require_roles("Super Admin")), db: Session = Depends(get_db)):
    row = db.query(models.RolePermission).filter(models.RolePermission.role == payload.role, models.RolePermission.module == payload.module).first()
    if not row:
        raise HTTPException(status_code=404, detail="Permission row not found")
    field_map = {"view": "perm_view", "create": "perm_create", "edit": "perm_edit", "delete": "perm_delete"}
    if payload.key not in field_map:
        raise HTTPException(status_code=400, detail="Unknown permission key")
    setattr(row, field_map[payload.key], payload.value)
    db.commit()
    log_audit(db, user.name, f"Updated {payload.role} permission: {payload.module}.{payload.key} = {payload.value}", "Roles & Permissions")
    return role_permissions_dict(db.query(models.RolePermission).all())
