# app/schemas/document.py
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
from .base import BaseSchema

class DocumentUpload(BaseModel):
    application_id: str
    document_type: str
    
    @validator('document_type')
    def validate_document_type(cls, v):
        allowed_types = [
            "Birth Certificate",
            "Residence Certificate",
            "Medical Certificate",
            "Drug Test Result",
            "Driving Course Certificate",
            "Previous License",
            "Valid ID",
            "Passport Photo"
        ]
        if v not in allowed_types:
            raise ValueError(f'Document type must be one of: {", ".join(allowed_types)}')
        return v

class DocumentResponse(BaseSchema):
    document_id: str
    application_id: str
    document_type: str
    file_url: str
    uploaded_at: datetime
    is_verified: bool = False
    verified_by: Optional[str] = None
