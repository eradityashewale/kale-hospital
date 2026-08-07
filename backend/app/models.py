import datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from .database import Base


def utcnow():
    return datetime.datetime.utcnow()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Super Admin, Admin, Doctor, Receptionist, Nurse
    phone = Column(String, default="")
    department = Column(String, default="")
    ward = Column(String, default="")
    totp_secret = Column(String, nullable=True)
    totp_enabled = Column(Boolean, default=False)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)


class Setting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(Text, default="{}")


class Department(Base):
    __tablename__ = "departments"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    head = Column(String, default="")
    created_at = Column(DateTime, default=utcnow)


class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, default="Pharmacy")
    contact_person = Column(String, default="")
    phone = Column(String, default="")
    email = Column(String, default="")
    address = Column(String, default="")
    status = Column(String, default="Active")


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    department = Column(String, default="")
    specialization = Column(String, default="")
    status = Column(String, default="Available")
    experience = Column(String, default="")
    phone = Column(String, default="")
    email = Column(String, default="")
    shift = Column(String, default="Morning")


class Nurse(Base):
    __tablename__ = "nurses"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    ward = Column(String, default="")
    shift = Column(String, default="Morning")
    status = Column(String, default="On Duty")
    phone = Column(String, default="")


class Receptionist(Base):
    __tablename__ = "receptionists"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    desk = Column(String, default="")
    shift = Column(String, default="Morning")
    status = Column(String, default="On Duty")
    phone = Column(String, default="")


class LabTechnician(Base):
    __tablename__ = "lab_technicians"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    dept = Column(String, default="Pathology")
    shift = Column(String, default="Morning")
    status = Column(String, default="On Duty")
    phone = Column(String, default="")


class Pharmacist(Base):
    __tablename__ = "pharmacists"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    dept = Column(String, default="Pharmacy")
    shift = Column(String, default="Morning")
    status = Column(String, default="On Duty")
    phone = Column(String, default="")


class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    gender = Column(String, default="")
    dob = Column(String, default="")
    mobile = Column(String, default="")
    alt_mobile = Column(String, default="")
    email = Column(String, default="")
    address = Column(String, default="")
    blood_group = Column(String, default="")
    aadhaar = Column(String, default="")
    emergency_contact = Column(String, default="")
    insurance_provider = Column(String, default="None")
    insurance_policy_no = Column(String, default="")
    insurance_coverage = Column(String, default="")
    allergies = Column(Text, default="")
    diseases = Column(Text, default="")
    department = Column(String, default="")
    doctor = Column(String, default="")
    status = Column(String, default="OPD")
    ward = Column(String, default="")
    room = Column(String, default="")
    bed = Column(String, default="")
    photo = Column(Text, nullable=True)
    vitals = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    visits = relationship("PatientVisit", back_populates="patient", cascade="all, delete-orphan", order_by="desc(PatientVisit.id)")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan", order_by="desc(Prescription.id)")
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan", order_by="desc(Admission.id)")
    bills = relationship("Bill", back_populates="patient", cascade="all, delete-orphan", order_by="desc(Bill.id)")


class PatientVisit(Base):
    __tablename__ = "patient_visits"
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    date = Column(String, default="")
    type = Column(String, default="")
    doctor = Column(String, default="")
    diagnosis = Column(String, default="")

    patient = relationship("Patient", back_populates="visits")


class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    date = Column(String, default="")
    doctor = Column(String, default="")
    medicines = Column(Text, default="")
    follow_up = Column(String, default="")

    patient = relationship("Patient", back_populates="prescriptions")


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    patient_name = Column(String, default="")
    department = Column(String, default="")
    doctor = Column(String, default="")
    date = Column(String, default="")
    time = Column(String, default="")
    token = Column(String, default="")
    status = Column(String, default="Pending")


class Referral(Base):
    __tablename__ = "referrals"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    patient_name = Column(String, default="")
    from_department = Column(String, default="")
    to_department = Column(String, nullable=False)
    doctor = Column(String, default="")
    reason = Column(Text, default="")
    status = Column(String, default="Pending")
    date = Column(String, default="")
    referred_by = Column(String, default="")


class OpdVisit(Base):
    __tablename__ = "opd_visits"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    patient_name = Column(String, default="")
    doctor = Column(String, default="")
    department = Column(String, default="")
    fee = Column(Float, default=0)
    symptoms = Column(Text, default="")
    diagnosis = Column(Text, default="")
    prescription = Column(Text, default="")
    follow_up = Column(String, default="")
    date = Column(String, default="")


class Admission(Base):
    __tablename__ = "admissions"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    patient_name = Column(String, default="")
    ward = Column(String, default="")
    room = Column(String, default="")
    bed = Column(String, default="")
    admission_date = Column(String, default="")
    doctor = Column(String, default="")
    treatment = Column(Text, default="")
    status = Column(String, default="Admitted")
    discharge_date = Column(String, nullable=True)
    discharge_summary = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="admissions")


class Bill(Base):
    __tablename__ = "bills"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    patient_name = Column(String, default="")
    amount = Column(Float, default=0)
    status = Column(String, default="Pending")
    date = Column(String, default="")
    mode = Column(String, default="Cash")

    patient = relationship("Patient", back_populates="bills")


class BedBuilding(Base):
    __tablename__ = "bed_buildings"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    floors = relationship("BedFloor", back_populates="building", cascade="all, delete-orphan")


class BedFloor(Base):
    __tablename__ = "bed_floors"
    id = Column(String, primary_key=True)
    building_id = Column(String, ForeignKey("bed_buildings.id"), nullable=False)
    name = Column(String, default="")
    type = Column(String, default="")

    building = relationship("BedBuilding", back_populates="floors")
    beds = relationship("Bed", back_populates="floor", cascade="all, delete-orphan")


class Bed(Base):
    __tablename__ = "beds"
    id = Column(String, primary_key=True)
    floor_id = Column(String, ForeignKey("bed_floors.id"), nullable=False)
    status = Column(String, default="Available")

    floor = relationship("BedFloor", back_populates="beds")


class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, default="")
    stock = Column(Integer, default=0)
    unit = Column(String, default="units")
    expiry = Column(String, default="")
    supplier = Column(String, default="")
    price = Column(Float, default=0)
    reorder_level = Column(Integer, default=10)


class LabTest(Base):
    __tablename__ = "lab_tests"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    patient_name = Column(String, default="")
    test = Column(String, default="")
    doctor = Column(String, default="")
    status = Column(String, default="Booked")
    date = Column(String, default="")


class RadiologyTest(Base):
    __tablename__ = "radiology_tests"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    patient_name = Column(String, default="")
    type = Column(String, default="")
    doctor = Column(String, default="")
    status = Column(String, default="Pending")
    date = Column(String, default="")


class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"
    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    patient_name = Column(String, default="")
    company = Column(String, default="")
    policy_no = Column(String, default="")
    coverage = Column(Float, default=0)
    claimed = Column(Float, default=0)
    approved = Column(Float, default=0)
    pending = Column(Float, default=0)
    status = Column(String, default="Pending")


class EmergencyCase(Base):
    __tablename__ = "emergency_cases"
    id = Column(String, primary_key=True)
    patient_name = Column(String, default="")
    condition = Column(String, default="Serious")
    doctor = Column(String, default="")
    ambulance = Column(String, default="No")
    triage = Column(String, default="")
    arrival = Column(String, default="")
    notes = Column(Text, default="")


class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, autoincrement=True)
    staff = Column(String, default="")
    role = Column(String, default="")
    date = Column(String, default="")
    shift = Column(String, default="")
    status = Column(String, default="Present")
    check_in = Column(String, default="")
    check_out = Column(String, default="")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    requester_name = Column(String, default="")
    role = Column(String, default="")
    leave_type = Column(String, nullable=False)
    start_date = Column(String, default="")
    end_date = Column(String, default="")
    reason = Column(Text, default="")
    status = Column(String, default="Pending")
    applied_at = Column(String, default="")
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(String, nullable=True)
    review_note = Column(Text, nullable=True)


class LeaveBalance(Base):
    __tablename__ = "leave_balances"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    leave_type = Column(String, nullable=False)
    allocated = Column(Integer, default=0)
    used = Column(Integer, default=0)

    __table_args__ = (UniqueConstraint("user_id", "leave_type", name="uq_user_leave_type"),)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True)
    type = Column(String, default="System")
    message = Column(Text, default="")
    recipient = Column(String, default="")
    status = Column(String, default="Sent")
    time = Column(String, default="")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    user = Column(String, default="System")
    action = Column(String, default="")
    module = Column(String, default="")
    timestamp = Column(String, default="")
    ip = Column(String, default="")


class RolePermission(Base):
    __tablename__ = "role_permissions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    role = Column(String, nullable=False)
    module = Column(String, nullable=False)
    perm_view = Column(Boolean, default=True)
    perm_create = Column(Boolean, default=False)
    perm_edit = Column(Boolean, default=False)
    perm_delete = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint("role", "module", name="uq_role_module"),)


class BackupRecord(Base):
    __tablename__ = "backup_records"
    id = Column(String, primary_key=True)
    date = Column(String, default="")
    size = Column(String, default="")
    status = Column(String, default="Completed")
    file_name = Column(String, nullable=True)


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True)
    category = Column(String, nullable=False)
    description = Column(Text, default="")
    amount = Column(Float, nullable=False)
    date = Column(String, default="")
    recorded_by = Column(String, default="")
