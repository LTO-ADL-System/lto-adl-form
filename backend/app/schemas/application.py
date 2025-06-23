# app/schemas/application.py
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum
from .base import BaseSchema, TimestampMixin

class ApplicationCategory(str, Enum):
    NEW = "New"
    RENEWAL = "Renewal"
    DUPLICATE = "Duplicate"

class ApplicationStatusType(str, Enum):
    PENDING = "Pending"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    COMPLETED = "Completed"

class ClutchType(str, Enum):
    MANUAL = "Manual"
    AUTOMATIC = "Automatic"
    SEMI_AUTOMATIC = "Semi‑automatic"

class ApplicationTypeResponse(BaseSchema):
    application_type_id: str
    type_category: ApplicationCategory

class ApplicationStatusResponse(BaseSchema):
    application_status_id: str
    status_description: str

class LicenseApplicationBase(BaseModel):
    application_type_id: str
    additional_requirements: Optional[str] = None

class LicenseApplicationCreate(LicenseApplicationBase):
    vehicle_categories: List[str]  # List of category_ids
    clutch_types: List[ClutchType]  # Corresponding clutch types
    
    @validator('clutch_types')
    def validate_clutch_types(cls, v, values):
        if 'vehicle_categories' in values:
            if len(v) != len(values['vehicle_categories']):
                raise ValueError('Number of clutch types must match number of vehicle categories')
        return v

class LicenseApplicationUpdate(BaseModel):
    application_status_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    additional_requirements: Optional[str] = None

class LicenseApplicationResponse(LicenseApplicationBase, BaseSchema, TimestampMixin):
    application_id: str
    applicant_id: str
    application_status_id: str
    submission_date: datetime
    rejection_reason: Optional[str] = None
    
    # Related objects
    application_type: Optional[ApplicationTypeResponse] = None
    status: Optional[ApplicationStatusResponse] = None

class ApplicationStatusHistoryResponse(BaseSchema):
    history_id: str
    application_id: str
    application_status_id: str
    status_change_date: datetime
    changed_by: str
    status: Optional[ApplicationStatusResponse] = None
