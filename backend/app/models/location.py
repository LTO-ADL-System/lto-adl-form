# app/models/location.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .appointment import Appointment

class Location(Base):
    __tablename__ = "location"
    
    # Auto-generated location ID with format LCTID_001, LCTID_002, etc.
    location_id = Column(
        String, 
        primary_key=True,
        server_default=text("'LCTID_' || lpad(nextval('location_seq')::text, 3, '0')")
    )
    
    location_name = Column(String, nullable=False)
    location_address = Column(Text, nullable=False)
    
    # Relationships
    appointments = relationship("Appointment", back_populates="location")

