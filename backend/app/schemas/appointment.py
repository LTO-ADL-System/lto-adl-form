# app/schemas/appointment.py
from pydantic import BaseModel, validator
from datetime import date, time, datetime
from typing import Optional
from enum import Enum
from .base import BaseSchema

class AppointmentStatus(str, Enum):
    SCHEDULED = "Scheduled"
    COMPLETED = "Completed"
    RESCHEDULE = "Reschedule"
    CANCELLED = "Cancelled"
    MISSED = "Missed"

class LocationResponse(BaseSchema):
    location_id: str
    location_name: str
    location_address: str

class AppointmentBase(BaseModel):
    location_id: str
    appointment_date: date
    appointment_time: time
    
    @validator('appointment_date')
    def validate_future_date(cls, v):
        if v <= date.today():
            raise ValueError('Appointment date must be in the future')
        return v

class AppointmentCreate(AppointmentBase):
    application_id: str

class AppointmentUpdate(BaseModel):
    location_id: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    status: Optional[AppointmentStatus] = None

class AppointmentResponse(AppointmentBase, BaseSchema):
    appointment_id: str
    application_id: str
    status: AppointmentStatus
    location: Optional[LocationResponse] = None
