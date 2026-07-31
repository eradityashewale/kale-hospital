import json

from sqlalchemy.orm import Session

from . import models


def _split(text):
    return [item.strip() for item in (text or "").split(",") if item.strip()]


def patient_summary_dict(p: models.Patient) -> dict:
    vitals = None
    if p.vitals:
        try:
            vitals = json.loads(p.vitals)
        except ValueError:
            vitals = None
    return {
        "id": p.id, "name": p.name, "gender": p.gender, "dob": p.dob,
        "mobile": p.mobile, "altMobile": p.alt_mobile, "email": p.email, "address": p.address,
        "bloodGroup": p.blood_group, "aadhaar": p.aadhaar, "emergencyContact": p.emergency_contact,
        "insurance": {"provider": p.insurance_provider, "policyNo": p.insurance_policy_no, "coverage": p.insurance_coverage},
        "allergies": _split(p.allergies), "diseases": _split(p.diseases),
        "department": p.department, "doctor": p.doctor, "status": p.status,
        "ward": p.ward, "room": p.room, "bed": p.bed, "photo": p.photo, "vitals": vitals,
    }


def patient_full_dict(db: Session, p: models.Patient) -> dict:
    data = patient_summary_dict(p)
    data["visits"] = [
        {"date": v.date, "type": v.type, "doctor": v.doctor, "diagnosis": v.diagnosis} for v in p.visits
    ]
    data["prescriptions"] = [
        {"date": rx.date, "doctor": rx.doctor, "medicines": rx.medicines, "followUp": rx.follow_up} for rx in p.prescriptions
    ]
    data["admissions"] = [
        {
            "date": a.admission_date, "ward": a.ward, "room": a.room, "bed": a.bed, "doctor": a.doctor,
            "treatment": a.treatment, "status": a.status, "dischargeDate": a.discharge_date,
            "dischargeSummary": a.discharge_summary,
        } for a in p.admissions
    ]
    data["bills"] = [
        {"id": b.id, "amount": b.amount, "status": b.status, "date": b.date, "mode": b.mode} for b in p.bills
    ]
    lab_reports = db.query(models.LabTest).filter(models.LabTest.patient_id == p.id).all()
    data["labReports"] = [{"date": t.date, "test": t.test, "status": t.status} for t in lab_reports]
    radiology = db.query(models.RadiologyTest).filter(models.RadiologyTest.patient_id == p.id).all()
    data["radiologyReports"] = [{"date": t.date, "type": t.type, "status": t.status} for t in radiology]
    return data


def admission_dict(a: models.Admission) -> dict:
    return {
        "id": a.id, "patient": a.patient_name, "patientId": a.patient_id, "ward": a.ward, "room": a.room, "bed": a.bed,
        "admissionDate": a.admission_date, "doctor": a.doctor, "treatment": a.treatment, "status": a.status,
        "dischargeDate": a.discharge_date, "dischargeSummary": a.discharge_summary,
    }


def bill_dict(b: models.Bill) -> dict:
    return {"id": b.id, "patientId": b.patient_id, "patient": b.patient_name, "amount": b.amount, "status": b.status, "date": b.date, "mode": b.mode}


def appointment_dict(a: models.Appointment) -> dict:
    return {
        "id": a.id, "patientId": a.patient_id, "patient": a.patient_name, "department": a.department,
        "doctor": a.doctor, "date": a.date, "time": a.time, "token": a.token, "status": a.status,
    }


def opd_dict(v: models.OpdVisit) -> dict:
    return {
        "id": v.id, "patientId": v.patient_id, "patient": v.patient_name, "doctor": v.doctor, "department": v.department,
        "fee": v.fee, "symptoms": v.symptoms, "diagnosis": v.diagnosis, "prescription": v.prescription,
        "followUp": v.follow_up, "date": v.date,
    }


def lab_dict(t: models.LabTest) -> dict:
    return {"id": t.id, "patientId": t.patient_id, "patient": t.patient_name, "test": t.test, "doctor": t.doctor, "status": t.status, "date": t.date}


def radiology_dict(t: models.RadiologyTest) -> dict:
    return {"id": t.id, "patientId": t.patient_id, "patient": t.patient_name, "type": t.type, "doctor": t.doctor, "status": t.status, "date": t.date}


def claim_dict(c: models.InsuranceClaim) -> dict:
    return {
        "id": c.id, "patientId": c.patient_id, "patient": c.patient_name, "company": c.company, "policyNo": c.policy_no,
        "coverage": c.coverage, "claimed": c.claimed, "approved": c.approved, "pending": c.pending, "status": c.status,
    }


def medicine_dict(m: models.Medicine) -> dict:
    return {"id": m.id, "name": m.name, "category": m.category, "stock": m.stock, "unit": m.unit, "expiry": m.expiry, "supplier": m.supplier, "price": m.price}


def emergency_dict(e: models.EmergencyCase) -> dict:
    return {"id": e.id, "patient": e.patient_name, "condition": e.condition, "doctor": e.doctor, "ambulance": e.ambulance, "triage": e.triage, "arrival": e.arrival, "notes": e.notes}


def attendance_dict(a: models.Attendance) -> dict:
    return {"id": a.id, "staff": a.staff, "role": a.role, "date": a.date, "shift": a.shift, "status": a.status, "checkIn": a.check_in, "checkOut": a.check_out}


def notification_dict(n: models.Notification) -> dict:
    return {"id": n.id, "type": n.type, "message": n.message, "recipient": n.recipient, "status": n.status, "time": n.time, "read": n.read}


def audit_dict(a: models.AuditLog) -> dict:
    return {"id": a.id, "user": a.user, "action": a.action, "module": a.module, "timestamp": a.timestamp, "ip": a.ip}


def backup_dict(b: models.BackupRecord) -> dict:
    return {"id": b.id, "date": b.date, "size": b.size, "status": b.status}


def department_dict(db: Session, d: models.Department) -> dict:
    doctors_count = db.query(models.Doctor).filter(models.Doctor.department == d.name).count()
    opd_today = db.query(models.OpdVisit).filter(models.OpdVisit.department == d.name).count()
    ipd_today = db.query(models.Patient).filter(models.Patient.department == d.name, models.Patient.status.in_(["IPD", "Critical"])).count()
    return {"id": d.id, "name": d.name, "head": d.head, "doctors": doctors_count, "opdToday": opd_today, "ipdToday": ipd_today}


def doctor_dict(d: models.Doctor) -> dict:
    return {"id": d.id, "name": d.name, "department": d.department, "specialization": d.specialization, "status": d.status, "experience": d.experience, "phone": d.phone, "email": d.email, "shift": d.shift}


def nurse_dict(n: models.Nurse) -> dict:
    return {"id": n.id, "name": n.name, "ward": n.ward, "shift": n.shift, "status": n.status, "phone": n.phone}


def receptionist_dict(r: models.Receptionist) -> dict:
    return {"id": r.id, "name": r.name, "desk": r.desk, "shift": r.shift, "status": r.status, "phone": r.phone}


def lab_tech_dict(t: models.LabTechnician) -> dict:
    return {"id": t.id, "name": t.name, "dept": t.dept, "shift": t.shift, "status": t.status, "phone": t.phone}


def pharmacist_dict(p: models.Pharmacist) -> dict:
    return {"id": p.id, "name": p.name, "dept": p.dept, "shift": p.shift, "status": p.status, "phone": p.phone}


def branch_dict(b: models.Branch) -> dict:
    return {"id": b.id, "name": b.name, "location": b.location, "beds": b.beds, "staff": b.staff, "status": b.status}


def user_dict(u: models.User) -> dict:
    return {"id": u.id, "name": u.name, "email": u.email, "role": u.role, "phone": u.phone, "department": u.department, "ward": u.ward}


def bed_buildings_dict(buildings: list[models.BedBuilding]) -> list:
    return [
        {
            "id": b.id,
            "building": b.name,
            "floors": [
                {
                    "id": f.id,
                    "floor": f.name,
                    "type": f.type,
                    "beds": [{"id": bed.id, "status": bed.status} for bed in f.beds],
                }
                for f in b.floors
            ],
        }
        for b in buildings
    ]


def role_permissions_dict(rows: list[models.RolePermission]) -> dict:
    result: dict = {}
    for row in rows:
        result.setdefault(row.role, {})[row.module] = {
            "view": row.perm_view, "create": row.perm_create, "edit": row.perm_edit, "delete": row.perm_delete,
        }
    return result
