# app/models/employment.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .applicant import Applicant

class Employment(Base):
    __tablename__ = "employment"
    
    # Auto-generated employment ID with format EMP_001, EMP_002, etc.
    employment_id = Column(
        String, 
        primary_key=True,
        server_default=text("'EMP_' || lpad(nextval('employment_seq')::text, 3, '0')")
    )
    
    # Foreign Key
    applicant_id = Column(String, ForeignKey("applicant.applicant_id"), nullable=False)
    
    # Employment details
    employer_name = Column(String, nullable=False)
    employer_tel_no = Column(String)
    employer_address = Column(String)
    
    # Relationships
    applicant = relationship("Applicant", back_populates="employment")

