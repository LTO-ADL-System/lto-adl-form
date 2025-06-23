# app/schemas/employment.py
from pydantic import BaseModel, validator
from typing import Optional
import re
from .base import BaseSchema

class EmploymentBase(BaseModel):
    employer_name: str
    employer_tel_no: Optional[str] = None
    employer_address: Optional[str] = None
    
    @validator('employer_tel_no')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v

class EmploymentCreate(EmploymentBase):
    applicant_id: str

class EmploymentResponse(EmploymentBase, BaseSchema):
    employment_id: str
    applicant_id: str 