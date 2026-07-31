from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models
from ..audit import log_audit
from ..database import get_db
from ..deps import get_current_user, require_roles
from ..ids import new_id
from ..serializers import bed_buildings_dict

router = APIRouter(prefix="/api/beds", tags=["beds"])

CYCLE = ["Available", "Occupied", "Reserved", "Cleaning"]
MANAGERS = ("Super Admin", "Admin", "Nurse")


class BuildingPayload(BaseModel):
    name: str


class FloorPayload(BaseModel):
    name: str = ""
    type: str = ""


class BedPayload(BaseModel):
    id: str


@router.get("")
def list_beds(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return bed_buildings_dict(db.query(models.BedBuilding).all())


@router.post("/{bed_id}/cycle")
def cycle_bed(bed_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    bed = db.query(models.Bed).filter(models.Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    bed.status = CYCLE[(CYCLE.index(bed.status) + 1) % len(CYCLE)]
    db.commit()
    log_audit(db, user.name, f"{bed.id} marked as {bed.status}", "Bed Management")
    return {"id": bed.id, "status": bed.status}


@router.post("/buildings")
def create_building(payload: BuildingPayload, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    building = models.BedBuilding(id=new_id("BLDG"), name=payload.name)
    db.add(building)
    db.commit()
    log_audit(db, user.name, f"Added building {payload.name}", "Bed Management")
    return bed_buildings_dict([building])[0]


@router.patch("/buildings/{building_id}")
def update_building(building_id: str, payload: BuildingPayload, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    building = db.query(models.BedBuilding).filter(models.BedBuilding.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    building.name = payload.name
    db.commit()
    log_audit(db, user.name, f"Renamed building to {payload.name}", "Bed Management")
    return bed_buildings_dict([building])[0]


@router.delete("/buildings/{building_id}")
def delete_building(building_id: str, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    building = db.query(models.BedBuilding).filter(models.BedBuilding.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    db.delete(building)
    db.commit()
    log_audit(db, user.name, f"Deleted building {building.name}", "Bed Management")
    return {"ok": True}


@router.post("/buildings/{building_id}/floors")
def create_floor(building_id: str, payload: FloorPayload, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    building = db.query(models.BedBuilding).filter(models.BedBuilding.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    floor = models.BedFloor(id=new_id("FLR"), building_id=building_id, name=payload.name, type=payload.type)
    db.add(floor)
    db.commit()
    log_audit(db, user.name, f"Added floor {payload.name} to {building.name}", "Bed Management")
    return bed_buildings_dict([building])[0]


@router.patch("/floors/{floor_id}")
def update_floor(floor_id: str, payload: FloorPayload, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    floor = db.query(models.BedFloor).filter(models.BedFloor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    floor.name = payload.name
    floor.type = payload.type
    db.commit()
    log_audit(db, user.name, f"Updated floor {payload.name}", "Bed Management")
    return bed_buildings_dict([floor.building])[0]


@router.delete("/floors/{floor_id}")
def delete_floor(floor_id: str, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    floor = db.query(models.BedFloor).filter(models.BedFloor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    building = floor.building
    db.delete(floor)
    db.commit()
    log_audit(db, user.name, f"Deleted floor {floor.name} from {building.name}", "Bed Management")
    return {"ok": True}


@router.post("/floors/{floor_id}/beds")
def create_bed(floor_id: str, payload: BedPayload, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    floor = db.query(models.BedFloor).filter(models.BedFloor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    bed_id = payload.id.strip()
    if not bed_id:
        raise HTTPException(status_code=400, detail="Bed label is required")
    if db.query(models.Bed).filter(models.Bed.id == bed_id).first():
        raise HTTPException(status_code=400, detail=f"Bed '{bed_id}' already exists")
    bed = models.Bed(id=bed_id, floor_id=floor_id, status="Available")
    db.add(bed)
    db.commit()
    log_audit(db, user.name, f"Added bed {bed_id} to {floor.name}", "Bed Management")
    return bed_buildings_dict([floor.building])[0]


@router.delete("/{bed_id}")
def delete_bed(bed_id: str, user: models.User = Depends(require_roles(*MANAGERS)), db: Session = Depends(get_db)):
    bed = db.query(models.Bed).filter(models.Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    db.delete(bed)
    db.commit()
    log_audit(db, user.name, f"Deleted bed {bed_id}", "Bed Management")
    return {"ok": True}
