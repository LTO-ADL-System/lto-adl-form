from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .base import Base

class Admin(Base):
    __tablename__ = "admin"
    
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="admin")
    is_active = Column(Boolean, default=True)
    can_approve_applications = Column(Boolean, default=True)
    can_manage_users = Column(Boolean, default=False)
    can_view_analytics = Column(Boolean, default=True)
    can_manage_appointments = Column(Boolean, default=True)
    created_date = Column(DateTime, default=datetime.utcnow)
    last_updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Admin(admin_id='{self.admin_id}', email='{self.email}', role='{self.role}')>" 