"""Service for audit logging."""
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.data.database import SessionLocal


def log_audit(admin_id: int, action: str, details: str = None):
    """Background task: log an admin action to audit trail."""
    db = SessionLocal()
    try:
        entry = AuditLog(admin_id=admin_id, action=action, details=details)
        db.add(entry)
        db.commit()
    finally:
        db.close()


def get_audit_logs(db: Session, limit: int = 100):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
