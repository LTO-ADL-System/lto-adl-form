# app/schemas/vehicle.py
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from .base import BaseSchema

class VehicleType(str, Enum):
    LIGHT = "Light"
    HEAVY = "Heavy"

class VehicleCategoryResponse(BaseSchema):
    category_id: str
    category_description: str
    vehicle_type: VehicleType

class ApplicationVehicleCategoryCreate(BaseModel):
    application_id: str
    category_id: str
    clutch_type: str  # Manual, Automatic, Semi‑automatic

class ApplicationVehicleCategoryResponse(BaseSchema):
    app_vehicle_id: str
    application_id: str
    category_id: str
    clutch_type: str
    vehicle_category: Optional[VehicleCategoryResponse] = None
