from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .application import LicenseApplication

class DrivingSkill(Base):
    __tablename__ = "drivingskill"
    
    # Auto-generated skill ID with format SKLID_001, SKLID_002, etc.
    skill_id = Column(
        String, 
        primary_key=True,
        server_default=text("'SKLID_' || lpad(nextval('skill_seq')::text, 3, '0')")
    )
    
    # Foreign Key
    application_id = Column(String, ForeignKey("licenseapplication.application_id"), nullable=False)
    
    # Driving skill details
    acquisition_type = Column(Text, nullable=False)
    instructor_license = Column(String)
    
    __table_args__ = (
        CheckConstraint(
            "acquisition_type IN ('LTO-Accredited Driving School', 'TESDA', 'Private Licensed Person')",
            name="check_acquisition_type"
        ),
    )
    
    # Relationships
    application = relationship("LicenseApplication", back_populates="driving_skills") 