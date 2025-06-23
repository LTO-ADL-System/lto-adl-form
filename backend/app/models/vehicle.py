# app/models/vehicle.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base

if TYPE_CHECKING:
    from .application import ApplicationVehicleCategory

class VehicleCategory(Base):
    __tablename__ = "vehiclecategory"
    
    category_id = Column(String, primary_key=True)
    category_description = Column(Text, nullable=False)
    vehicle_type = Column(Text, nullable=False)
    
    __table_args__ = (
        CheckConstraint(
            "category_id ~ '^VCID_[A-Z0-9]{2}$'",
            name="check_category_id_format"
        ),
        CheckConstraint(
            "vehicle_type IN ('Light', 'Heavy')",
            name="check_vehicle_type"
        ),
    )
    
    # Relationships
    application_categories = relationship("ApplicationVehicleCategory", back_populates="vehicle_category")
