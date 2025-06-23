# app/models/application.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
from sqlalchemy.sql import func, text

if TYPE_CHECKING:
    from .applicant import Applicant
    from .appointment import Appointment
    from .document import SubmittedDocument
    from .vehicle import VehicleCategory
    from .license_condition import LicenseCondition
    from .driving_skill import DrivingSkill

class ApplicationStatus(Base):
    __tablename__ = "applicationstatus"
    
    application_status_id = Column(String, primary_key=True)
    status_description = Column(String, nullable=False)
    
    __table_args__ = (
        CheckConstraint(
            "application_status_id ~ '^ASID_[A-Z]{3}$'",
            name="check_application_status_id_format"
        ),
    )
    
    # Relationships
    applications = relationship("LicenseApplication", back_populates="status")
    status_history = relationship("ApplicationStatusHistory", back_populates="status")

class ApplicationType(Base):
    __tablename__ = "applicationtype"
    
    application_type_id = Column(String, primary_key=True)
    type_category = Column(Text, nullable=False)
    
    __table_args__ = (
        CheckConstraint(
            "application_type_id ~ '^ATID_[A-Z0-9]{1,2}$'",
            name="check_application_type_id_format"
        ),
        CheckConstraint(
            "type_category IN ('New', 'Renewal', 'Duplicate')",
            name="check_type_category"
        ),
    )
    
    # Relationships
    applications = relationship("LicenseApplication", back_populates="application_type")

class LicenseApplication(Base):
    __tablename__ = "licenseapplication"
    
    # Auto-generated application ID with format APPID_001, APPID_002, etc.
    application_id = Column(
        String, 
        primary_key=True,
        server_default=text("'APPID_' || LPAD(nextval('application_seq')::text, 3, '0')")
    )
    
    # Foreign Keys
    applicant_id = Column(String, ForeignKey("applicant.applicant_id"), nullable=False)
    application_type_id = Column(String, ForeignKey("applicationtype.application_type_id"), nullable=False)
    application_status_id = Column(String, ForeignKey("applicationstatus.application_status_id"), nullable=False)
    
    # Application details
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    last_updated_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    rejection_reason = Column(Text)
    additional_requirements = Column(String)
    
    # Relationships
    applicant = relationship("Applicant", back_populates="license_applications")
    application_type = relationship("ApplicationType", back_populates="applications")
    status = relationship("ApplicationStatus", back_populates="applications")
    status_history = relationship("ApplicationStatusHistory", back_populates="application")
    appointments = relationship("Appointment", back_populates="application")
    submitted_documents = relationship("SubmittedDocument", back_populates="application")
    vehicle_categories = relationship("ApplicationVehicleCategory", back_populates="application")
    license_conditions = relationship("LicenseCondition", back_populates="application")
    driving_skills = relationship("DrivingSkill", back_populates="application")

class ApplicationStatusHistory(Base):
    __tablename__ = "applicationstatushistory"
    
    # Auto-generated history ID with format SHID_001, SHID_002, etc.
    history_id = Column(
        String, 
        primary_key=True,
        server_default=text("'SHID_' || LPAD(nextval('history_seq')::text, 3, '0')")
    )
    
    # Foreign Keys
    application_id = Column(String, ForeignKey("licenseapplication.application_id"), nullable=False)
    application_status_id = Column(String, ForeignKey("applicationstatus.application_status_id"), nullable=False)
    
    # Status change details
    status_change_date = Column(DateTime(timezone=True), server_default=func.now())
    changed_by = Column(String, nullable=False)
    
    # Relationships
    application = relationship("LicenseApplication", back_populates="status_history")
    status = relationship("ApplicationStatus", back_populates="status_history")

class ApplicationVehicleCategory(Base):
    __tablename__ = "applicationvehiclecategory"
    
    # Auto-generated ID with format AVID_001, AVID_002, etc.
    app_vehicle_id = Column(
        String, 
        primary_key=True,
        server_default=text("'AVID_' || LPAD(nextval('appvehicle_seq')::text, 3, '0')")
    )
    
    # Foreign Keys
    application_id = Column(String, ForeignKey("licenseapplication.application_id"), nullable=False)
    category_id = Column(String, ForeignKey("vehiclecategory.category_id"), nullable=False)
    
    # Clutch type
    clutch_type = Column(Text, nullable=False)
    
    __table_args__ = (
        CheckConstraint(
            "clutch_type IN ('Manual', 'Automatic', 'Semi‑automatic')",
            name="check_clutch_type"
        ),
    )
    
    # Relationships
    application = relationship("LicenseApplication", back_populates="vehicle_categories")
    vehicle_category = relationship("VehicleCategory", back_populates="application_categories")

