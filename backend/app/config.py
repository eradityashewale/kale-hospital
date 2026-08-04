import os

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get("HMS_SECRET_KEY", "Kale Hospital-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12

DATABASE_URL = os.environ.get("HMS_DATABASE_URL", "sqlite:///./Kale Hospital.db")

_origins = os.environ.get("HMS_CORS_ORIGINS", "*")
CORS_ORIGINS = ["*"] if _origins.strip() == "*" else [o.strip() for o in _origins.split(",") if o.strip()]

# Kale Surgical Hospital, Chalisgaon Road, Maharashtra — same coords used on the public homepage map.
HOSPITAL_LAT = float(os.environ.get("HMS_HOSPITAL_LAT", "20.5531054"))
HOSPITAL_LON = float(os.environ.get("HMS_HOSPITAL_LON", "74.5210681"))
HOSPITAL_CHECKIN_RADIUS_METERS = float(os.environ.get("HMS_CHECKIN_RADIUS_M", "300"))
