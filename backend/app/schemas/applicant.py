# app/schemas/applicant.py
from pydantic import BaseModel, validator, EmailStr
from datetime import date
from typing import Optional
from enum import Enum
import re
from .base import BaseSchema, TimestampMixin

class CivilStatus(str, Enum):
    MARRIED = "Married"
    SINGLE = "Single"
    WIDOWED = "Widowed"
    SEPARATED = "Separated"

class EducationalAttainment(str, Enum):
    POSTGRADUATE = "Postgraduate"
    COLLEGE = "College"
    HIGH_SCHOOL = "High School"
    ELEMENTARY = "Elementary"

class BloodType(str, Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"

class Sex(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class ApplicantBase(BaseModel):
    family_name: str
    first_name: str
    middle_name: Optional[str] = None
    address: str
    contact_num: str
    nationality: str
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
        from datetime import date
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 15:
            raise ValueError('Applicant must be at least 15 years old')
        if age > 100:
            raise ValueError('Invalid birthdate')
        return v
    
    @validator('tin')
    def validate_tin(cls, v):
        if v is not None and not re.match(r'^[0-9]{9}$', v):
            raise ValueError('TIN must be exactly 9 digits')
        return v

class MinimalApplicantCreate(BaseModel):
    """Minimal applicant creation for initial registration - only email required"""
    email: EmailStr
    uuid: Optional[str] = None  # Will be set from Supabase auth
    
    # Optional fields with defaults for initial registration
    family_name: Optional[str] = "Not Set"
    first_name: Optional[str] = "Not Set"
    middle_name: Optional[str] = None
    address: Optional[str] = "Not Set"
    contact_num: Optional[str] = "+63XXXXXXXXXX"
    nationality: Optional[str] = "Filipino"
    birthdate: Optional[date] = None
    birthplace: Optional[str] = "Not Set"
    height: Optional[float] = 170.0
    weight: Optional[float] = 70.0
    eye_color: Optional[str] = "Brown"
    civil_status: Optional[CivilStatus] = CivilStatus.SINGLE
    educational_attainment: Optional[EducationalAttainment] = EducationalAttainment.COLLEGE
    blood_type: Optional[BloodType] = BloodType.O_POSITIVE
    sex: Optional[Sex] = Sex.MALE
    tin: Optional[str] = None  # Tax Identification Number - 9 digits
    is_organ_donor: Optional[bool] = False

class ApplicantCreate(BaseModel):
    """Full applicant creation schema - all fields optional for flexibility"""
    email: Optional[EmailStr] = None
    uuid: Optional[str] = None
    
    # Personal Information - all optional
    family_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    address: Optional[str] = None
    contact_num: Optional[str] = None
    nationality: Optional[str] = "Filipino"
    birthdate: Optional[date] = None
    birthplace: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    eye_color: Optional[str] = None
    civil_status: Optional[CivilStatus] = None
    educational_attainment: Optional[EducationalAttainment] = None
    blood_type: Optional[BloodType] = None
    sex: Optional[Sex] = None
    tin: Optional[str] = None  # Tax Identification Number - 9 digits
    is_organ_donor: Optional[bool] = False

    @validator('contact_num')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v
    
    @validator('height')
    def validate_height(cls, v):
        if v is not None and (v <= 0 or v > 300):
            raise ValueError('Height must be between 0 and 300 cm')
        return v
    
    @validator('weight')
    def validate_weight(cls, v):
        if v is not None and (v <= 0 or v > 500):
            raise ValueError('Weight must be between 0 and 500 kg')
        return v
    
    @validator('birthdate')
    def validate_age(cls, v):
        if v is not None:
            from datetime import date
            today = date.today()
            age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
            if age < 15:
                raise ValueError('Applicant must be at least 15 years old')
            if age > 100:
                raise ValueError('Invalid birthdate')
        return v
    
    @validator('tin')
    def validate_tin(cls, v):
        if v is not None and not re.match(r'^[0-9]{9}$', v):
            raise ValueError('TIN must be exactly 9 digits')
        return v

class ApplicantUpdate(BaseModel):
    family_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    address: Optional[str] = None
    contact_num: Optional[str] = None
    nationality: Optional[str] = None
    birthdate: Optional[date] = None
    birthplace: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    eye_color: Optional[str] = None
    civil_status: Optional[CivilStatus] = None
    educational_attainment: Optional[EducationalAttainment] = None
    blood_type: Optional[BloodType] = None
    sex: Optional[Sex] = None
    tin: Optional[str] = None  # Tax Identification Number - 9 digits
    is_organ_donor: Optional[bool] = None

    @validator('contact_num')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v
    
    @validator('tin')
    def validate_tin(cls, v):
        if v is not None and not re.match(r'^[0-9]{9}$', v):
            raise ValueError('TIN must be exactly 9 digits')
        return v

class ApplicantResponse(ApplicantBase, BaseSchema, TimestampMixin):
    applicant_id: str
    email: Optional[str] = None
    license_number: Optional[str] = None
    profile_completed: Optional[bool] = False

class ApplicantProfile(ApplicantResponse):
    """Extended profile with additional computed fields"""
    age: Optional[int] = None
    full_name: Optional[str] = None
    
    class Config:
        orm_mode = True
