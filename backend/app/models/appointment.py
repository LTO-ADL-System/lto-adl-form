# app/models/appointment.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Date, Time, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .application import LicenseApplication
    from .location import Location

class Appointment(Base):
    __tablename__ = "appointment"
    
    # Auto-generated appointment ID with format APNID_001, APNID_002, etc.
    appointment_id = Column(
        String, 
        primary_key=True,
        server_default=text("'APNID_' || lpad(nextval('appointment_seq')::text, 3, '0')")
    )
    
    # Foreign Keys
    application_id = Column(String, ForeignKey("licenseapplication.application_id"), nullable=False)
    location_id = Column(String, ForeignKey("location.location_id"), nullable=False)
    
    # Appointment details
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(Text, nullable=False)
    
    __table_args__ = (
        CheckConstraint(
            "status IN ('Scheduled', 'Completed', 'Reschedule', 'Cancelled', 'Missed')",
            name="check_appointment_status"
        ),
    )
    
    # Relationships
    application = relationship("LicenseApplication", back_populates="appointments")
    location = relationship("Location", back_populates="appointments")
