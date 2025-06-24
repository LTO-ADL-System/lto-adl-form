# app/schemas/admin.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from .application import LicenseApplicationResponse
from .applicant import ApplicantResponse

class AdminBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "admin"
    is_active: bool = True
    can_approve_applications: bool = True
    can_manage_users: bool = False
    can_view_analytics: bool = True
    can_manage_appointments: bool = True

class AdminCreate(AdminBase):
    pass

class AdminUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    can_approve_applications: Optional[bool] = None
    can_manage_users: Optional[bool] = None
    can_view_analytics: Optional[bool] = None
    can_manage_appointments: Optional[bool] = None

class AdminResponse(AdminBase):
    uuid: str
    admin_id: str
    created_date: datetime
    last_updated_date: datetime
    
    class Config:
        orm_mode = True

class DashboardStats(BaseModel):
    total_applications: int
    pending_applications: int
    approved_applications: int
    rejected_applications: int
    total_applicants: int
    applications_today: int
    applications_this_month: int

class AdminApplicationResponse(LicenseApplicationResponse):
    applicant: Optional[ApplicantResponse] = None

class ApplicationApproval(BaseModel):
    license_number: str
    approved_by: str
    approval_notes: Optional[str] = None

class ApplicationRejection(BaseModel):
    rejection_reason: str
    rejected_by: str
    additional_requirements: Optional[str] = None

class DocumentVerification(BaseModel):
    is_verified: bool
    verified_by: str
    verification_notes: Optional[str] = None 