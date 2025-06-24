# app/schemas/application.py
from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from .base import BaseSchema, TimestampMixin
from .applicant import CivilStatus, EducationalAttainment, BloodType, Sex

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

class DocumentInfo(BaseModel):
    """Document information for application submission"""
    document_type_id: str
    document_name: str
    file_path: Optional[str] = None  # Will be set after upload
    notes: Optional[str] = None

class LicenseDetails(BaseModel):
    """License details for renewal/duplicate applications"""
    existing_license_number: Optional[str] = None
    license_expiry_date: Optional[date] = None
    license_restrictions: Optional[str] = None
    
class PersonalInfo(BaseModel):
    """Complete personal information for application"""
    family_name: str
    first_name: str
    middle_name: Optional[str] = None
    address: str
    contact_num: str
    nationality: str = "Filipino"
    birthdate: date
    birthplace: str
    height: float
    weight: float
    eye_color: str
    civil_status: CivilStatus
    educational_attainment: EducationalAttainment
    blood_type: BloodType
    sex: Sex
    tin: Optional[str] = None  # Tax Identification Number - 9 digits
    is_organ_donor: bool = False

    @validator('contact_num')
    def validate_phone(cls, v):
        import re
        if not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v
    
    @validator('height')
    def validate_height(cls, v):
        if v <= 0 or v > 300:
            raise ValueError('Height must be between 0 and 300 cm')
        return v
    
    @validator('weight')
    def validate_weight(cls, v):
        if v <= 0 or v > 500:
            raise ValueError('Weight must be between 0 and 500 kg')
        return v
    
    @validator('birthdate')
    def validate_age(cls, v):
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 15:
            raise ValueError('Applicant must be at least 15 years old')
        if age > 100:
            raise ValueError('Invalid birthdate')
        return v
    
    @validator('tin')
    def validate_tin(cls, v):
        if v is not None:
            import re
            if not re.match(r'^[0-9]{9}$', v):
                raise ValueError('TIN must be exactly 9 digits')
        return v

class CompleteApplicationCreate(BaseModel):
    """Complete application submission schema"""
    # Application details
    application_type_id: str
    vehicle_categories: List[str]  # List of category_ids
    clutch_types: List[ClutchType]  # Corresponding clutch types
    additional_requirements: Optional[str] = None
    
    # Personal information
    personal_info: PersonalInfo
    
    # License details (for renewal/duplicate)
    license_details: Optional[LicenseDetails] = None
    
    # Documents information
    documents: List[DocumentInfo] = []
    
    # Emergency contacts
    emergency_contacts: Optional[List[dict]] = []
    
    # Employment information
    employment_info: Optional[List[dict]] = []
    
    # Family information
    family_info: Optional[List[dict]] = []
    
    @validator('clutch_types')
    def validate_clutch_types(cls, v, values):
        if 'vehicle_categories' in values:
            if len(v) != len(values['vehicle_categories']):
                raise ValueError('Number of clutch types must match number of vehicle categories')
        return v
    
    @validator('documents')
    def validate_required_documents(cls, v, values):
        # Basic validation - can be enhanced based on application type
        required_docs = ['DTID_BIRTH_CERT', 'DTID_VALID_ID']  # Example required docs
        provided_doc_types = [doc.document_type_id for doc in v]
        
        # For now, just ensure some documents are provided
        if len(v) < 1:
            raise ValueError('At least one document must be provided')
        return v

class CompleteApplicationResponse(BaseModel):
    """Response after successful complete application submission"""
    application_id: str
    applicant_id: str
    application_type_id: str
    application_status_id: str
    submission_date: datetime
    last_updated_date: datetime
    message: str
    
    # Summary of created records
    summary: dict

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

class LicenseApplicationResponse(LicenseApplicationBase, BaseSchema):
    application_id: str
    applicant_id: str
    application_status_id: str
    submission_date: datetime
    last_updated_date: datetime
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
