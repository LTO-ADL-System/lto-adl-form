from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc
from datetime import date, datetime, timedelta, time
from fastapi.encoders import jsonable_encoder
from app.crud.base import CRUDBase
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate

class CRUDAppointment(CRUDBase[Appointment, AppointmentCreate, AppointmentUpdate]):
    def create(self, db: Session, *, obj_in: AppointmentCreate) -> Appointment:
        """Create appointment with default status 'Scheduled'"""
        obj_in_data = jsonable_encoder(obj_in)
        # Set default status for new appointments
        obj_in_data['status'] = 'Scheduled'
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_id(self, db: Session, *, appointment_id: str) -> Optional[Appointment]:
        return db.query(Appointment).options(
            joinedload(Appointment.application),
            joinedload(Appointment.location)
        ).filter(Appointment.appointment_id == appointment_id).first()
    
    def get_by_application(self, db: Session, *, application_id: str) -> List[Appointment]:
        return db.query(Appointment).options(
            joinedload(Appointment.location)
        ).filter(
            Appointment.application_id == application_id
        ).order_by(desc(Appointment.appointment_date)).all()
    
    def get_by_applicant(self, db: Session, *, applicant_id: str) -> List[Appointment]:
        """Get appointments for a specific applicant"""
        return db.query(Appointment).options(
            joinedload(Appointment.application),
            joinedload(Appointment.location)
        ).join(Appointment.application).filter(
            Appointment.application.has(applicant_id=applicant_id)
        ).order_by(desc(Appointment.appointment_date)).all()
    
    def get_by_date(self, db: Session, *, appointment_date: date, location_id: Optional[str] = None) -> List[Appointment]:
        query = db.query(Appointment).options(
            joinedload(Appointment.application),
            joinedload(Appointment.location)
        ).filter(Appointment.appointment_date == appointment_date)
        
        if location_id:
            query = query.filter(Appointment.location_id == location_id)
        
        return query.order_by(Appointment.appointment_time).all()
    
    def get_upcoming_appointments(self, db: Session, *, location_id: Optional[str] = None, days_ahead: int = 7) -> List[Appointment]:
        """Get upcoming appointments"""
        today = date.today()
        future_date = today + timedelta(days=days_ahead)
        
        query = db.query(Appointment).options(
            joinedload(Appointment.application),
            joinedload(Appointment.location)
        ).filter(
            and_(
                Appointment.appointment_date >= today,
                Appointment.appointment_date <= future_date,
                Appointment.status == "Scheduled"
            )
        )
        
        if location_id:
            query = query.filter(Appointment.location_id == location_id)
        
        return query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()
    
    def get_available_slots(self, db: Session, *, location_id: str, appointment_date: date) -> List[str]:
        """Get available time slots for a specific date and location"""
        # Define working hours (9 AM to 5 PM)
        working_hours = [
            time(9, 0), time(9, 30), time(10, 0), time(10, 30),
            time(11, 0), time(11, 30), time(13, 0), time(13, 30),  # Skip 12:00-13:00 lunch
            time(14, 0), time(14, 30), time(15, 0), time(15, 30),
            time(16, 0), time(16, 30)
        ]
        
        # Get booked appointments for the date
        booked_appointments = db.query(Appointment).filter(
            and_(
                Appointment.location_id == location_id,
                Appointment.appointment_date == appointment_date,
                Appointment.status.in_(["Scheduled", "Reschedule"])
            )
        ).all()
        
        booked_times = [apt.appointment_time for apt in booked_appointments]
        available_times = [t for t in working_hours if t not in booked_times]
        
        return [t.strftime("%H:%M") for t in available_times]
    
    def reschedule(
        self, 
        db: Session, 
        *, 
        appointment_id: str, 
        new_date: date, 
        new_time: time,
        new_location_id: Optional[str] = None
    ) -> Optional[Appointment]:
        """Reschedule an appointment"""
        appointment = self.get_by_id(db, appointment_id=appointment_id)
        if not appointment:
            return None
        
        appointment.appointment_date = new_date
        appointment.appointment_time = new_time
        if new_location_id:
            appointment.location_id = new_location_id
        appointment.status = "Reschedule"
        
        db.commit()
        db.refresh(appointment)
        return appointment

crud_appointment = CRUDAppointment(Appointment)
