import datetime

from sqlalchemy.orm import Session

from . import models
from .security import hash_password


def _today() -> str:
    return datetime.date.today().isoformat()


def _plus_days(days: int) -> str:
    return (datetime.date.today() + datetime.timedelta(days=days)).isoformat()


def seed_if_empty(db: Session) -> None:
    if db.query(models.User).count() > 0:
        return

    users = [
        models.User(id="U-1", email="superadmin@example.com", password_hash=hash_password("password"), name="Dr. Maya Singh", role="Super Admin", phone="+91 90000 10001"),
        models.User(id="U-2", email="admin@example.com", password_hash=hash_password("password"), name="Ethan Brooks", role="Admin", phone="+91 90000 10002"),
        models.User(id="U-3", email="doctor@example.com", password_hash=hash_password("password"), name="Dr. Asha Rao", role="Doctor", phone="+91 90000 10003", department="Cardiology"),
        models.User(id="U-4", email="receptionist@example.com", password_hash=hash_password("password"), name="Nina Patel", role="Receptionist", phone="+91 90000 10004"),
        models.User(id="U-5", email="nurse@example.com", password_hash=hash_password("password"), name="Riya Thomas", role="Nurse", phone="+91 90000 10005", ward="Ward 4"),
    ]
    db.add_all(users)

    departments = [
        models.Department(id="DEP-1", name="Cardiology", head="Dr. Asha Rao"),
        models.Department(id="DEP-2", name="Orthopaedics", head="Dr. Gaurav Patel"),
        models.Department(id="DEP-3", name="Neurology", head="Dr. Priya Nair"),
        models.Department(id="DEP-4", name="Pediatrics", head="Dr. Kabir Mehta"),
        models.Department(id="DEP-5", name="General Medicine", head="Dr. Asha Rao"),
    ]
    db.add_all(departments)

    doctors = [
        models.Doctor(id="DOC-1", name="Dr. Asha Rao", department="Cardiology", specialization="Interventional Cardiology", status="Available", experience="12 yrs", phone="+91 98000 11001", email="asha.rao@Kale Hospital.in", shift="Morning"),
        models.Doctor(id="DOC-2", name="Dr. Gaurav Patel", department="Orthopaedics", specialization="Joint Replacement", status="In Surgery", experience="9 yrs", phone="+91 98000 11002", email="gaurav.patel@Kale Hospital.in", shift="Morning"),
        models.Doctor(id="DOC-3", name="Dr. Priya Nair", department="Neurology", specialization="Stroke Care", status="Available", experience="15 yrs", phone="+91 98000 11003", email="priya.nair@Kale Hospital.in", shift="Evening"),
        models.Doctor(id="DOC-4", name="Dr. Kabir Mehta", department="Pediatrics", specialization="Neonatology", status="On Leave", experience="7 yrs", phone="+91 98000 11004", email="kabir.mehta@Kale Hospital.in", shift="Morning"),
        models.Doctor(id="DOC-5", name="Dr. Sara Iyer", department="General Medicine", specialization="Internal Medicine", status="Available", experience="5 yrs", phone="+91 98000 11005", email="sara.iyer@Kale Hospital.in", shift="Night"),
    ]
    db.add_all(doctors)

    nurses = [
        models.Nurse(id="NUR-1", name="Riya Thomas", ward="Ward 4", shift="Morning", status="On Duty", phone="+91 97000 22001"),
        models.Nurse(id="NUR-2", name="Meera Joseph", ward="ICU", shift="Night", status="On Duty", phone="+91 97000 22002"),
        models.Nurse(id="NUR-3", name="Anjali Suresh", ward="Ward 2", shift="Evening", status="On Leave", phone="+91 97000 22003"),
    ]
    db.add_all(nurses)

    receptionists = [
        models.Receptionist(id="REC-1", name="Nina Patel", desk="Front Desk 1", shift="Morning", status="On Duty", phone="+91 96000 33001"),
        models.Receptionist(id="REC-2", name="Farhan Sheikh", desk="Front Desk 2", shift="Evening", status="On Duty", phone="+91 96000 33002"),
    ]
    db.add_all(receptionists)

    db.add(models.LabTechnician(id="LAB-T1", name="Vikram Sethi", dept="Pathology", shift="Morning", status="On Duty", phone="+91 95000 44001"))
    db.add(models.Pharmacist(id="PHM-1", name="Divya Kapoor", dept="Pharmacy", shift="Morning", status="On Duty", phone="+91 94000 55001"))

    patients_data = [
        dict(id="PAT-1001", name="Aisha Khan", gender="Female", dob="1991-04-12", mobile="+91 90111 22001", alt_mobile="", email="aisha.khan@mail.com",
             address="221B Lakeview Road, Bengaluru", blood_group="O+", aadhaar="•••• •••• 4432", emergency_contact="Imran Khan (+91 90111 90001)",
             insurance_provider="StarHealth", insurance_policy_no="SH-88213", insurance_coverage="₹5,00,000", allergies="Penicillin", diseases="Hypertension",
             department="Cardiology", doctor="Dr. Asha Rao", status="IPD", ward="Ward 4", room="402", bed="B1"),
        dict(id="PAT-1002", name="Mohan Verma", gender="Male", dob="1984-11-02", mobile="+91 90111 22002", alt_mobile="+91 90111 22012", email="mohan.verma@mail.com",
             address="14 Green Park, Bengaluru", blood_group="B+", aadhaar="•••• •••• 5521", emergency_contact="Sunita Verma (+91 90111 90002)",
             insurance_provider="HDFC Ergo", insurance_policy_no="HE-11934", insurance_coverage="₹3,00,000", allergies="", diseases="Diabetes Type 2",
             department="Orthopaedics", doctor="Dr. Gaurav Patel", status="OPD", ward="", room="", bed=""),
        dict(id="PAT-1003", name="Sana Iqbal", gender="Female", dob="1998-02-19", mobile="+91 90111 22003", alt_mobile="", email="sana.iqbal@mail.com",
             address="9 Palm Grove, Bengaluru", blood_group="AB-", aadhaar="•••• •••• 6612", emergency_contact="Yusuf Iqbal (+91 90111 90003)",
             insurance_provider="None", insurance_policy_no="—", insurance_coverage="—", allergies="Sulfa drugs", diseases="Epilepsy",
             department="Neurology", doctor="Dr. Priya Nair", status="Critical", ward="ICU", room="ICU-2", bed="B3"),
        dict(id="PAT-1004", name="Karthik Iyer", gender="Male", dob="1975-06-30", mobile="+91 90111 22004", alt_mobile="", email="karthik.iyer@mail.com",
             address="77 Church Street, Bengaluru", blood_group="A+", aadhaar="•••• •••• 7788", emergency_contact="Lakshmi Iyer (+91 90111 90004)",
             insurance_provider="LIC Health", insurance_policy_no="LIC-44210", insurance_coverage="₹2,00,000", allergies="", diseases="",
             department="General Medicine", doctor="Dr. Sara Iyer", status="Discharged", ward="Ward 2", room="210", bed="B2"),
    ]
    for pdata in patients_data:
        db.add(models.Patient(**pdata))
    db.flush()

    db.add_all([
        models.PatientVisit(patient_id="PAT-1001", date="2026-07-28", type="OPD", doctor="Dr. Asha Rao", diagnosis="Chest pain evaluation"),
        models.PatientVisit(patient_id="PAT-1002", date="2026-07-30", type="OPD", doctor="Dr. Gaurav Patel", diagnosis="Knee pain follow-up"),
        models.PatientVisit(patient_id="PAT-1003", date="2026-07-30", type="Emergency", doctor="Dr. Priya Nair", diagnosis="Seizure episode"),
        models.PatientVisit(patient_id="PAT-1004", date="2026-07-20", type="IPD", doctor="Dr. Sara Iyer", diagnosis="Dengue fever"),
    ])
    db.add_all([
        models.Prescription(patient_id="PAT-1001", date="2026-07-28", doctor="Dr. Asha Rao", medicines="Atorvastatin 10mg, Metoprolol 25mg", follow_up="2026-08-10"),
        models.Prescription(patient_id="PAT-1002", date="2026-07-30", doctor="Dr. Gaurav Patel", medicines="Ibuprofen 400mg", follow_up="2026-08-14"),
        models.Prescription(patient_id="PAT-1003", date="2026-07-30", doctor="Dr. Priya Nair", medicines="Levetiracetam 500mg IV", follow_up="2026-08-02"),
        models.Prescription(patient_id="PAT-1004", date="2026-07-24", doctor="Dr. Sara Iyer", medicines="Paracetamol 650mg", follow_up="2026-08-01"),
    ])
    db.add_all([
        models.Admission(id="IPD-3001", patient_id="PAT-1001", patient_name="Aisha Khan", ward="Ward 4", room="402", bed="B1", admission_date="2026-07-29", doctor="Dr. Asha Rao", treatment="Cardiac monitoring", status="Admitted"),
        models.Admission(id="IPD-3002", patient_id="PAT-1003", patient_name="Sana Iqbal", ward="ICU", room="ICU-2", bed="B3", admission_date="2026-07-30", doctor="Dr. Priya Nair", treatment="Seizure management", status="Admitted"),
        models.Admission(id="IPD-3003", patient_id="PAT-1004", patient_name="Karthik Iyer", ward="Ward 2", room="210", bed="B2", admission_date="2026-07-20", doctor="Dr. Sara Iyer", treatment="Dengue management", status="Discharged", discharge_date="2026-07-25"),
    ])
    db.add_all([
        models.Bill(id="INV-201", patient_id="PAT-1001", patient_name="Aisha Khan", amount=32000, status="Paid", date="2026-07-29", mode="Insurance"),
        models.Bill(id="INV-202", patient_id="PAT-1002", patient_name="Mohan Verma", amount=14500, status="Partial", date="2026-07-30", mode="Card"),
        models.Bill(id="INV-203", patient_id="PAT-1003", patient_name="Sana Iqbal", amount=51000, status="Pending", date="2026-07-30", mode="—"),
        models.Bill(id="INV-204", patient_id="PAT-1004", patient_name="Karthik Iyer", amount=28000, status="Paid", date="2026-07-25", mode="Cash"),
    ])

    db.add_all([
        models.Appointment(id="APT-1", patient_id="PAT-1001", patient_name="Aisha Khan", department="Cardiology", doctor="Dr. Asha Rao", date=_today(), time="09:00", token="T-14", status="Confirmed"),
        models.Appointment(id="APT-2", patient_id="PAT-1002", patient_name="Mohan Verma", department="Orthopaedics", doctor="Dr. Gaurav Patel", date=_today(), time="11:30", token="T-15", status="Pending"),
        models.Appointment(id="APT-3", patient_id="PAT-1003", patient_name="Sana Iqbal", department="Neurology", doctor="Dr. Priya Nair", date=_today(), time="14:00", token="T-16", status="Confirmed"),
        models.Appointment(id="APT-4", patient_id="PAT-1004", patient_name="Karthik Iyer", department="General Medicine", doctor="Dr. Sara Iyer", date=_plus_days(1), time="10:15", token="T-01", status="Pending"),
    ])

    db.add_all([
        models.OpdVisit(id="OPD-5001", patient_id="PAT-1001", patient_name="Aisha Khan", doctor="Dr. Asha Rao", department="Cardiology", fee=600, symptoms="Chest tightness", diagnosis="Stable angina", prescription="Atorvastatin 10mg", follow_up=_plus_days(10), date=_today()),
        models.OpdVisit(id="OPD-5002", patient_id="PAT-1002", patient_name="Mohan Verma", doctor="Dr. Gaurav Patel", department="Orthopaedics", fee=500, symptoms="Knee stiffness", diagnosis="Osteoarthritis", prescription="Ibuprofen 400mg", follow_up=_plus_days(14), date=_today()),
    ])

    building1 = models.BedBuilding(id="BLD-1", name="Main Building")
    db.add(building1)
    floor1 = models.BedFloor(id="FLR-1", building_id="BLD-1", name="Ground Floor", type="General Ward")
    floor2 = models.BedFloor(id="FLR-2", building_id="BLD-1", name="2nd Floor", type="Ward 2 / Ward 4")
    db.add_all([floor1, floor2])
    db.add_all([
        models.Bed(id="GF-B1", floor_id="FLR-1", status="Occupied"), models.Bed(id="GF-B2", floor_id="FLR-1", status="Available"),
        models.Bed(id="GF-B3", floor_id="FLR-1", status="Available"), models.Bed(id="GF-B4", floor_id="FLR-1", status="Cleaning"),
        models.Bed(id="GF-B5", floor_id="FLR-1", status="Reserved"), models.Bed(id="GF-B6", floor_id="FLR-1", status="Available"),
        models.Bed(id="W2-B1", floor_id="FLR-2", status="Available"), models.Bed(id="W2-B2", floor_id="FLR-2", status="Occupied"),
        models.Bed(id="W4-B1", floor_id="FLR-2", status="Occupied"), models.Bed(id="W4-B2", floor_id="FLR-2", status="Available"),
        models.Bed(id="W4-B3", floor_id="FLR-2", status="Reserved"),
    ])
    building2 = models.BedBuilding(id="BLD-2", name="Critical Care Block")
    db.add(building2)
    floor3 = models.BedFloor(id="FLR-3", building_id="BLD-2", name="ICU", type="Intensive Care")
    floor4 = models.BedFloor(id="FLR-4", building_id="BLD-2", name="NICU", type="Neonatal ICU")
    floor5 = models.BedFloor(id="FLR-5", building_id="BLD-2", name="OT Suite", type="Operation Theatre")
    db.add_all([floor3, floor4, floor5])
    db.add_all([
        models.Bed(id="ICU-B1", floor_id="FLR-3", status="Occupied"), models.Bed(id="ICU-B2", floor_id="FLR-3", status="Available"),
        models.Bed(id="ICU-B3", floor_id="FLR-3", status="Occupied"), models.Bed(id="ICU-B4", floor_id="FLR-3", status="Available"),
        models.Bed(id="NICU-B1", floor_id="FLR-4", status="Available"), models.Bed(id="NICU-B2", floor_id="FLR-4", status="Available"),
        models.Bed(id="NICU-B3", floor_id="FLR-4", status="Occupied"),
        models.Bed(id="OT-1", floor_id="FLR-5", status="Occupied"), models.Bed(id="OT-2", floor_id="FLR-5", status="Cleaning"),
        models.Bed(id="OT-3", floor_id="FLR-5", status="Available"),
    ])

    db.add_all([
        models.Medicine(id="MED-1", name="Insulin Glargine", category="Injectable", stock=42, unit="vials", expiry="2026-10-18", supplier="MedSupply Co.", price=420),
        models.Medicine(id="MED-2", name="IV Fluids (NS 0.9%)", category="IV Fluid", stock=9, unit="bottles", expiry="2026-08-02", supplier="CarePharma", price=65),
        models.Medicine(id="MED-3", name="Bandages", category="Consumable", stock=112, unit="rolls", expiry="2027-02-14", supplier="MedSupply Co.", price=25),
        models.Medicine(id="MED-4", name="Atorvastatin 10mg", category="Tablet", stock=6, unit="strips", expiry="2026-09-05", supplier="Zenith Pharma", price=85),
        models.Medicine(id="MED-5", name="Paracetamol 650mg", category="Tablet", stock=220, unit="strips", expiry="2027-05-20", supplier="Zenith Pharma", price=20),
    ])

    db.add_all([
        models.LabTest(id="LAB-9001", patient_id="PAT-1002", patient_name="Mohan Verma", test="CBC", doctor="Dr. Gaurav Patel", status="Completed", date="2026-07-25"),
        models.LabTest(id="LAB-9002", patient_id="PAT-1003", patient_name="Sana Iqbal", test="CT Scan", doctor="Dr. Priya Nair", status="Pending", date="2026-07-30"),
        models.LabTest(id="LAB-9003", patient_id="PAT-1001", patient_name="Aisha Khan", test="Lipid Panel", doctor="Dr. Asha Rao", status="Reviewed", date="2026-07-28"),
        models.LabTest(id="LAB-9004", patient_id="PAT-1004", patient_name="Karthik Iyer", test="Platelet Count", doctor="Dr. Sara Iyer", status="Sample Collected", date="2026-07-31"),
    ])

    db.add_all([
        models.RadiologyTest(id="RAD-7001", patient_id="PAT-1003", patient_name="Sana Iqbal", type="CT Scan", doctor="Dr. Priya Nair", status="Pending", date="2026-07-30"),
        models.RadiologyTest(id="RAD-7002", patient_id="PAT-1002", patient_name="Mohan Verma", type="X-Ray", doctor="Dr. Gaurav Patel", status="Reviewed", date="2026-07-26"),
    ])

    db.add_all([
        models.InsuranceClaim(id="CLM-1", patient_id="PAT-1001", patient_name="Aisha Khan", company="StarHealth", policy_no="SH-88213", coverage=500000, claimed=32000, approved=32000, pending=0, status="Approved"),
        models.InsuranceClaim(id="CLM-2", patient_id="PAT-1002", patient_name="Mohan Verma", company="HDFC Ergo", policy_no="HE-11934", coverage=300000, claimed=14500, approved=8000, pending=6500, status="Pending"),
        models.InsuranceClaim(id="CLM-3", patient_id="PAT-1003", patient_name="Sana Iqbal", company="—", policy_no="—", coverage=0, claimed=0, approved=0, pending=0, status="Rejected"),
    ])

    db.add_all([
        models.EmergencyCase(id="ER-1", patient_name="Sana Iqbal", condition="Critical", doctor="Dr. Priya Nair", ambulance="Yes", triage="Level 1 — Immediate", arrival="14:02", notes="Seizure on arrival, stabilized in ER."),
        models.EmergencyCase(id="ER-2", patient_name="Unknown (RTA)", condition="Serious", doctor="Dr. Sara Iyer", ambulance="Yes", triage="Level 2 — Emergent", arrival="15:40", notes="Road traffic accident, multiple fractures suspected."),
    ])

    db.add_all([
        models.Attendance(staff="Dr. Asha Rao", role="Doctor", date=_today(), status="Present", check_in="08:55", check_out="—"),
        models.Attendance(staff="Dr. Gaurav Patel", role="Doctor", date=_today(), status="Present", check_in="09:05", check_out="—"),
        models.Attendance(staff="Riya Thomas", role="Nurse", date=_today(), status="Present", check_in="07:50", check_out="—"),
        models.Attendance(staff="Nina Patel", role="Receptionist", date=_today(), status="Present", check_in="08:30", check_out="—"),
        models.Attendance(staff="Dr. Kabir Mehta", role="Doctor", date=_today(), status="On Leave", check_in="—", check_out="—"),
    ])

    db.add_all([
        models.Notification(id="N-1", type="SMS", message="Appointment reminder sent to Aisha Khan for 09:00 today.", recipient="Aisha Khan", status="Sent", time="2 min ago", read=False),
        models.Notification(id="N-2", type="System", message="IV Fluids (NS 0.9%) stock below threshold (9 bottles left).", recipient="Pharmacy team", status="Sent", time="18 min ago", read=False),
        models.Notification(id="N-3", type="Email", message="Invoice INV-201 emailed to aisha.khan@mail.com.", recipient="Aisha Khan", status="Sent", time="1 hr ago", read=True),
        models.Notification(id="N-4", type="WhatsApp", message="Medicine reminder sent to Mohan Verma.", recipient="Mohan Verma", status="Sent", time="3 hr ago", read=True),
        models.Notification(id="N-5", type="Emergency Alert", message="Critical patient Sana Iqbal admitted to ICU — care team notified.", recipient="Care team", status="Sent", time="4 hr ago", read=False),
    ])

    db.add_all([
        models.AuditLog(id="AUD-1", user="Nina Patel", action="Registered new patient", module="Patients", timestamp="2026-07-31 09:12", ip="10.0.0.14"),
        models.AuditLog(id="AUD-2", user="Dr. Asha Rao", action="Uploaded prescription", module="OPD", timestamp="2026-07-31 09:40", ip="10.0.0.22"),
        models.AuditLog(id="AUD-3", user="Ethan Brooks", action="Updated pharmacy stock", module="Pharmacy", timestamp="2026-07-31 10:05", ip="10.0.0.9"),
        models.AuditLog(id="AUD-4", user="Dr. Maya Singh", action="Modified role permissions", module="Roles & Permissions", timestamp="2026-07-31 10:20", ip="10.0.0.2"),
        models.AuditLog(id="AUD-5", user="Riya Thomas", action="Recorded vitals", module="Nursing", timestamp="2026-07-31 10:32", ip="10.0.0.31"),
    ])

    db.add_all([
        models.BackupRecord(id="BKP-1", date="2026-07-31 03:00", size="2.4 GB", status="Completed"),
        models.BackupRecord(id="BKP-2", date="2026-07-30 03:00", size="2.4 GB", status="Completed"),
        models.BackupRecord(id="BKP-3", date="2026-07-29 03:00", size="2.3 GB", status="Completed"),
    ])

    modules = ["Dashboard", "Patients", "Appointments", "OPD", "IPD", "Billing", "Pharmacy", "Laboratory", "Radiology", "Staff", "Reports", "Settings"]
    role_defaults = {
        "Super Admin": lambda m: dict(view=True, create=True, edit=True, delete=True),
        "Admin": lambda m: dict(view=True, create=True, edit=True, delete=m != "Settings"),
        "Doctor": lambda m: dict(
            view=m in ["Dashboard", "Patients", "Appointments", "OPD", "IPD", "Laboratory", "Radiology", "Reports"],
            create=m in ["OPD", "IPD"], edit=m in ["OPD", "IPD", "Patients"], delete=False,
        ),
        "Receptionist": lambda m: dict(
            view=m in ["Dashboard", "Patients", "Appointments", "OPD", "Billing", "Reports"],
            create=m in ["Patients", "Appointments", "OPD", "Billing"], edit=m in ["Appointments", "Billing"], delete=False,
        ),
        "Nurse": lambda m: dict(view=m in ["Dashboard", "Patients", "IPD"], create=False, edit=m in ["IPD"], delete=False),
    }
    for role, resolver in role_defaults.items():
        for module in modules:
            perms = resolver(module)
            db.add(models.RolePermission(role=role, module=module, perm_view=perms["view"], perm_create=perms["create"], perm_edit=perms["edit"], perm_delete=perms["delete"]))

    db.commit()
