# app/schemas/emergency.py
from pydantic import BaseModel, validator
from typing import Optional
import re
from .base import BaseSchema

class EmergencyContactBase(BaseModel):
    ec_name: str
    ec_address: Optional[str] = None
    ec_contact_no: str
    
    @validator('ec_contact_no')
    def validate_phone(cls, v):
        if not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v

class EmergencyContactCreate(EmergencyContactBase):
    applicant_id: str

class EmergencyContactResponse(EmergencyContactBase, BaseSchema):
    contact_id: str
    applicant_id: str 