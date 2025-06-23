from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .applicant import Applicant

class EmergencyContact(Base):
    __tablename__ = "emergencycontact"
    
    # Auto-generated contact ID with format ECID_001, ECID_002, etc.
    contact_id = Column(
        String, 
        primary_key=True,
        server_default=text("'ECID_' || lpad(nextval('ec_seq')::text, 3, '0')")
    )
    
    # Foreign Key
    applicant_id = Column(String, ForeignKey("applicant.applicant_id"), nullable=False)
    
    # Emergency contact details
    ec_name = Column(String, nullable=False)
    ec_address = Column(Text)
    ec_contact_no = Column(String, nullable=False)
    
    __table_args__ = (
        CheckConstraint(
            "ec_contact_no ~ '^\\+63\\d{10}$'",
            name="check_ec_contact_no_format"
        ),
    )
    
    # Relationships
    applicant = relationship("Applicant", back_populates="emergency_contacts") 