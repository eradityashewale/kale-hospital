from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, serializers
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api", tags=["bootstrap"])


@router.get("/bootstrap")
def bootstrap(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    patients = db.query(models.Patient).order_by(models.Patient.created_at.desc()).all()
    data = {
        "departments": [serializers.department_dict(db, d) for d in db.query(models.Department).all()],
        "doctors": [serializers.doctor_dict(d) for d in db.query(models.Doctor).all()],
        "nurses": [serializers.nurse_dict(n) for n in db.query(models.Nurse).all()],
        "receptionists": [serializers.receptionist_dict(r) for r in db.query(models.Receptionist).all()],
        "labTechnicians": [serializers.lab_tech_dict(t) for t in db.query(models.LabTechnician).all()],
        "pharmacists": [serializers.pharmacist_dict(p) for p in db.query(models.Pharmacist).all()],
        "branches": [serializers.branch_dict(b) for b in db.query(models.Branch).all()],
        "patients": [serializers.patient_full_dict(db, p) for p in patients],
        "appointments": [serializers.appointment_dict(a) for a in db.query(models.Appointment).order_by(models.Appointment.id.desc()).all()],
        "opdVisits": [serializers.opd_dict(v) for v in db.query(models.OpdVisit).order_by(models.OpdVisit.id.desc()).all()],
        "ipdAdmissions": [serializers.admission_dict(a) for a in db.query(models.Admission).order_by(models.Admission.id.desc()).all()],
        "bedBuildings": serializers.bed_buildings_dict(db.query(models.BedBuilding).all()),
        "medicines": [serializers.medicine_dict(m) for m in db.query(models.Medicine).all()],
        "labTests": [serializers.lab_dict(t) for t in db.query(models.LabTest).order_by(models.LabTest.id.desc()).all()],
        "radiologyTests": [serializers.radiology_dict(t) for t in db.query(models.RadiologyTest).order_by(models.RadiologyTest.id.desc()).all()],
        "bills": [serializers.bill_dict(b) for b in db.query(models.Bill).order_by(models.Bill.id.desc()).all()],
        "insuranceClaims": [serializers.claim_dict(c) for c in db.query(models.InsuranceClaim).all()],
        "emergencyCases": [serializers.emergency_dict(e) for e in db.query(models.EmergencyCase).order_by(models.EmergencyCase.id.desc()).all()],
        "attendanceRecords": [serializers.attendance_dict(a) for a in db.query(models.Attendance).all()],
        "notifications": [serializers.notification_dict(n) for n in db.query(models.Notification).order_by(models.Notification.created_at.desc()).all()],
        "backupHistory": [serializers.backup_dict(b) for b in db.query(models.BackupRecord).order_by(models.BackupRecord.id.desc()).all()],
        "rolePermissions": serializers.role_permissions_dict(db.query(models.RolePermission).all()),
    }
    if user.role == "Super Admin":
        data["users"] = [serializers.user_dict(u) for u in db.query(models.User).all()]
        data["auditLogs"] = [serializers.audit_dict(a) for a in db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).all()]
    return data
