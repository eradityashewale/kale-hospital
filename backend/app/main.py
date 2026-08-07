from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from . import models
from .config import CORS_ORIGINS
from .database import Base, SessionLocal, engine
from .seed import seed_if_empty

from .routers import (
    appointments,
    audit_logs,
    auth,
    backup,
    beds,
    billing,
    bootstrap,
    departments,
    emergency,
    expenses,
    ipd,
    lab_radiology,
    leave,
    notifications,
    opd,
    patients,
    pharmacy,
    referrals,
    roles,
    settings,
    staff,
    users,
    vendors,
)

Base.metadata.create_all(bind=engine)


def _add_column_if_missing(inspector, table: str, column: str, ddl: str) -> None:
    if table not in inspector.get_table_names():
        return
    cols = [col["name"] for col in inspector.get_columns(table)]
    if column not in cols:
        with engine.connect() as conn:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {ddl}"))
            conn.commit()


def _migrate_schema() -> None:
    # No Alembic here: create_all only adds missing tables, not missing
    # columns on tables that already existed before a model change. Uses the
    # SQLAlchemy inspector so this works on both SQLite and Postgres.
    inspector = inspect(engine)
    _add_column_if_missing(inspector, "attendance", "shift", "shift VARCHAR DEFAULT ''")
    _add_column_if_missing(inspector, "medicines", "reorder_level", "reorder_level INTEGER DEFAULT 10")
    _add_column_if_missing(inspector, "backup_records", "file_name", "file_name VARCHAR")
    _add_column_if_missing(inspector, "users", "totp_secret", "totp_secret VARCHAR")
    _add_column_if_missing(inspector, "users", "totp_enabled", "totp_enabled BOOLEAN DEFAULT FALSE")
    _add_column_if_missing(inspector, "users", "reset_token", "reset_token VARCHAR")
    _add_column_if_missing(inspector, "users", "reset_token_expires", "reset_token_expires VARCHAR")


_migrate_schema()

app = FastAPI(title="Kale Hospital HMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}


for router in (
    auth.router, bootstrap.router, patients.router, appointments.router, opd.router, ipd.router,
    beds.router, pharmacy.router, lab_radiology.router, billing.router, emergency.router,
    departments.router, staff.router, leave.router, expenses.router, referrals.router, vendors.router, users.router, roles.router,
    notifications.router, audit_logs.router, backup.router, settings.router,
):
    app.include_router(router)
