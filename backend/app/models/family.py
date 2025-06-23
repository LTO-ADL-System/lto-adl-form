# app/models/family.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .applicant import Applicant

class FamilyInformation(Base):
    __tablename__ = "familyinformation"
    
    # Auto-generated family info ID with format FID_001, FID_002, etc.
    family_info_id = Column(
        String, 
        primary_key=True,
        server_default=text("'FID_' || lpad(nextval('family_seq')::text, 3, '0')")
    )
    
    # Foreign Key
    applicant_id = Column(String, ForeignKey("applicant.applicant_id"), nullable=False)
    
    # Family member details
    relation_type = Column(Text, nullable=False)
    family_name = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    middle_name = Column(String)
    is_deceased = Column(Boolean, default=False)
    
    __table_args__ = (
        CheckConstraint(
            "relation_type IN ('Mother', 'Father', 'Spouse')",
            name="check_relation_type"
        ),
    )
    
    # Relationships
    applicant = relationship("Applicant", back_populates="family_information")

