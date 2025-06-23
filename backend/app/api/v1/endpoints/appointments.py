# app/api/v1/endpoints/appointments.py
from typing import List, Optional
from datetime import date, time
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import (
    get_db, 
    get_current_applicant, 
    get_appointment_owner,
    validate_pagination
)
from app.crud import crud_appointment, crud_location, crud_application
from app.models.applicant import Applicant
from app.models.appointment import Appointment
from app.schemas.appointment import (
    AppointmentCreate, 
    AppointmentUpdate, 
    AppointmentResponse
)
from app.schemas.response import ResponseModel, PaginatedResponse

router = APIRouter()

@router.post("/", response_model=ResponseModel[AppointmentResponse])
async def schedule_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Schedule a new appointment"""
    
    # Verify application belongs to current user
    application = crud_application.get_by_id(db, application_id=appointment_data.application_id)
    if not application or application.applicant_id != current_applicant.applicant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this application"
        )
    
    # Verify location exists
    location = crud_location.get_by_id(db, location_id=appointment_data.location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Check if time slot is available
    existing_appointments = crud_appointment.get_by_date(
        db, 
        appointment_date=appointment_data.appointment_date,
        location_id=appointment_data.location_id
    )
    
    time_conflict = any(
        apt.appointment_time == appointment_data.appointment_time 
        and apt.status in ["Scheduled", "Reschedule"]
        for apt in existing_appointments
    )
    
    if time_conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time slot is already booked"
        )
    
    # Create appointment
    appointment = crud_appointment.create(db, obj_in=appointment_data)
    
    return ResponseModel(
        success=True,
        message="Appointment scheduled successfully",
        data=appointment
    )

@router.get("/", response_model=PaginatedResponse[AppointmentResponse])
async def get_my_appointments(
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant),
    pagination: tuple = Depends(validate_pagination)
):
    """Get current user's appointments"""
    
    appointments = crud_appointment.get_by_applicant(
        db, applicant_id=current_applicant.applicant_id
    )
    
    skip, limit = pagination
    paginated_appointments = appointments[skip:skip+limit]
    
    return PaginatedResponse(
        success=True,
        message="Appointments retrieved successfully",
        data=paginated_appointments,
        total=len(appointments),
        page=skip // limit + 1,
        size=limit,
        pages=(len(appointments) + limit - 1) // limit
    )

@router.get("/{appointment_id}", response_model=ResponseModel[AppointmentResponse])
async def get_appointment(
    appointment: Appointment = Depends(get_appointment_owner)
):
    """Get specific appointment by ID"""
    
    return ResponseModel(
        success=True,
        message="Appointment retrieved successfully",
        data=appointment
    )

@router.put("/{appointment_id}", response_model=ResponseModel[AppointmentResponse])
async def update_appointment(
    appointment_update: AppointmentUpdate,
    db: Session = Depends(get_db),
    appointment: Appointment = Depends(get_appointment_owner)
):
    """Update appointment (reschedule)"""
    
    # Check if trying to reschedule
    if appointment_update.appointment_date or appointment_update.appointment_time:
        new_date = appointment_update.appointment_date or appointment.appointment_date
        new_time = appointment_update.appointment_time or appointment.appointment_time
        new_location = appointment_update.location_id or appointment.location_id
        
        # Check availability for new time slot
        existing_appointments = crud_appointment.get_by_date(
            db, 
            appointment_date=new_date,
            location_id=new_location
        )
        
        time_conflict = any(
            apt.appointment_time == new_time 
            and apt.status in ["Scheduled", "Reschedule"]
            and apt.appointment_id != appointment.appointment_id
            for apt in existing_appointments
        )
        
        if time_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New time slot is already booked"
            )
    
    updated_appointment = crud_appointment.update(
        db, db_obj=appointment, obj_in=appointment_update
    )
    
    return ResponseModel(
        success=True,
        message="Appointment updated successfully",
        data=updated_appointment
    )

@router.delete("/{appointment_id}", response_model=ResponseModel[dict])
async def cancel_appointment(
    db: Session = Depends(get_db),
    appointment: Appointment = Depends(get_appointment_owner)
):
    """Cancel appointment"""
    
    # Update status to cancelled instead of deleting
    appointment.status = "Cancelled"
    db.commit()
    
    return ResponseModel(
        success=True,
        message="Appointment cancelled successfully",
        data={"appointment_id": appointment.appointment_id}
    )

@router.get("/locations/{location_id}/available-slots", response_model=ResponseModel[List[str]])
async def get_available_slots(
    location_id: str,
    appointment_date: date = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """Get available time slots for a location and date"""
    
    # Verify location exists
    location = crud_location.get_by_id(db, location_id=location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    available_slots = crud_appointment.get_available_slots(
        db, 
        location_id=location_id,
        appointment_date=appointment_date
    )
    
    return ResponseModel(
        success=True,
        message="Available slots retrieved successfully",
        data=available_slots
    )