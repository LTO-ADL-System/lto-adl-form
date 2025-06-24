from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .application import LicenseApplication

class LicenseConditionType(Base):
    __tablename__ = "licenseconditiontype"
    
    # Auto-generated condition type ID with format CTID_001, CTID_002, etc.
    condition_type_id = Column(
        String, 
        primary_key=True,
        server_default=text("'CTID_' || lpad(nextval('condtype_seq')::text, 3, '0')")
    )
    
    condition_description = Column(Text, nullable=False)
    
    # Relationships
    license_conditions = relationship("LicenseCondition", back_populates="condition_type")

class LicenseCondition(Base):
    __tablename__ = "licensecondition"
    
    # Auto-generated condition ID with format CID_001, CID_002, etc.
    condition_id = Column(
        String, 
        primary_key=True,
        server_default=text("'CID_' || lpad(nextval('condition_seq')::text, 3, '0')")
    )
    
    # Foreign Keys
    application_id = Column(String, ForeignKey("licenseapplication.application_id"), nullable=False)
    condition_type_id = Column(String, ForeignKey("licenseconditiontype.condition_type_id"), nullable=False)
    
    # Relationships
    application = relationship("LicenseApplication", back_populates="license_conditions")
    condition_type = relationship("LicenseConditionType", back_populates="license_conditions") 