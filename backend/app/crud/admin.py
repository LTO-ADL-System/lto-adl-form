# app/crud/admin.py
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from datetime import datetime, date
import random
import string
from uuid import UUID

from app.models.admin import Admin
from app.models.applicant import Applicant
from app.models.application import LicenseApplication, ApplicationStatusHistory
from app.models.document import SubmittedDocument
from app.models.appointment import Appointment
from app.schemas.admin import AdminCreate, AdminUpdate

class CRUDAdmin:
    """Administrative operations for managing the system"""
    
    def get_admin_by_email(self, db: Session, *, email: str) -> Optional[Admin]:
        """Get admin by email"""
        return db.query(Admin).filter(Admin.email == email).first()
    
    def get_admin_by_uuid(self, db: Session, *, uuid: UUID) -> Optional[Admin]:
        """Get admin by UUID"""
        return db.query(Admin).filter(Admin.uuid == uuid).first()
    
    def create_admin(self, db: Session, *, obj_in: AdminCreate, uuid: UUID) -> Admin:
        """Create new admin"""
        db_obj = Admin(
            uuid=uuid,
            email=obj_in.email,
            full_name=obj_in.full_name,
            role=obj_in.role,
            is_active=obj_in.is_active,
            can_approve_applications=obj_in.can_approve_applications,
            can_manage_users=obj_in.can_manage_users,
            can_view_analytics=obj_in.can_view_analytics,
            can_manage_appointments=obj_in.can_manage_appointments
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_admin(self, db: Session, *, db_obj: Admin, obj_in: AdminUpdate) -> Admin:
        """Update admin"""
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def ensure_default_admin(self, db: Session, *, email: str = "madalto.official@gmail.com") -> Optional[Admin]:
        """Ensure default admin exists for the specified email"""
        admin = self.get_admin_by_email(db, email=email)
        if not admin:
            # Create a placeholder admin record for the default admin email
            # This will be linked to Supabase auth user when they first login
            admin_data = AdminCreate(
                email=email,
                full_name="MadaLTO System Administrator",
                role="super_admin",
                can_manage_users=True
            )
            # We'll need to get the UUID from Supabase when they actually login
            # For now, return None to indicate this admin needs to be created via Supabase
            return None
        return admin
    
    def get_all_applications_admin(
        self, 
        db: Session, 
        *, 
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[LicenseApplication]:
        """Get all applications with filters for admin view"""
        
        query = db.query(LicenseApplication).options(
            joinedload(LicenseApplication.applicant),
            joinedload(LicenseApplication.application_type),
            joinedload(LicenseApplication.status)
        )
        
        # Apply status filter
        if status_filter:
            query = query.filter(LicenseApplication.application_status_id == status_filter)
        
        # Apply search filter
        if search_query:
            search_filter = or_(
                LicenseApplication.application_id.ilike(f"%{search_query}%"),
                LicenseApplication.applicant.has(
                    or_(
                        Applicant.first_name.ilike(f"%{search_query}%"),
                        Applicant.family_name.ilike(f"%{search_query}%"),
                        Applicant.contact_num.ilike(f"%{search_query}%")
                    )
                )
            )
            query = query.filter(search_filter)
        
        return query.order_by(desc(LicenseApplication.submission_date)).offset(skip).limit(limit).all()
    
    def approve_application(
        self, 
        db: Session, 
        *, 
        application_id: str, 
        license_number: str,
        approved_by: str,
        approval_notes: Optional[str] = None
    ) -> Optional[LicenseApplication]:
        """Approve an application and assign license number"""
        
        application = db.query(LicenseApplication).filter(
            LicenseApplication.application_id == application_id
        ).first()
        
        if not application:
            return None
        
        # Update application status
        application.application_status_id = "ASID_APP"
        
        # Update applicant with license number
        applicant = db.query(Applicant).filter(
            Applicant.applicant_id == application.applicant_id
        ).first()
        
        if applicant:
            applicant.license_number = license_number
        
        # Create status history
        history = ApplicationStatusHistory(
            application_id=application_id,
            application_status_id="ASID_APP",
            changed_by=approved_by
        )
        db.add(history)
        
        db.commit()
        db.refresh(application)
        return application
    
    def reject_application(
        self, 
        db: Session, 
        *, 
        application_id: str, 
        rejection_reason: str,
        rejected_by: str,
        additional_requirements: Optional[str] = None
    ) -> Optional[LicenseApplication]:
        """Reject an application with reason"""
        
        application = db.query(LicenseApplication).filter(
            LicenseApplication.application_id == application_id
        ).first()
        
        if not application:
            return None
        
        # Update application
        application.application_status_id = "ASID_REJ"
        application.rejection_reason = rejection_reason
        if additional_requirements:
            application.additional_requirements = additional_requirements
        
        # Create status history
        history = ApplicationStatusHistory(
            application_id=application_id,
            application_status_id="ASID_REJ",
            changed_by=rejected_by
        )
        db.add(history)
        
        db.commit()
        db.refresh(application)
        return application
    
    def get_pending_verifications(self, db: Session, skip: int = 0, limit: int = 100) -> List[SubmittedDocument]:
        """Get documents pending verification"""
        return db.query(SubmittedDocument).options(
            joinedload(SubmittedDocument.application).joinedload(LicenseApplication.applicant)
        ).filter(
            SubmittedDocument.is_verified == False
        ).order_by(SubmittedDocument.uploaded_at).offset(skip).limit(limit).all()
    
    def bulk_verify_documents(
        self, 
        db: Session, 
        *, 
        document_ids: List[str], 
        verified_by: str,
        is_verified: bool = True
    ) -> int:
        """Bulk verify multiple documents"""
        count = db.query(SubmittedDocument).filter(
            SubmittedDocument.document_id.in_(document_ids)
        ).update({
            "is_verified": is_verified,
            "verified_by": verified_by
        }, synchronize_session=False)
        
        db.commit()
        return count
    
    def get_system_health(self, db: Session) -> Dict[str, Any]:
        """Get system health metrics"""
        today = date.today()
        
        # Application processing metrics
        avg_processing_time = db.query(
            func.avg(
                func.extract('epoch', LicenseApplication.last_updated_date - LicenseApplication.submission_date) / 86400
            )
        ).filter(
            LicenseApplication.application_status_id.in_(["ASID_APP", "ASID_REJ"])
        ).scalar()
        
        # Document verification backlog
        unverified_docs = db.query(SubmittedDocument).filter(
            SubmittedDocument.is_verified == False
        ).count()
        
        # Appointment utilization
        total_appointments_today = db.query(Appointment).filter(
            Appointment.appointment_date == today
        ).count()
        
        completed_appointments_today = db.query(Appointment).filter(
            and_(
                Appointment.appointment_date == today,
                Appointment.status == "Completed"
            )
        ).count()
        
        return {
            "average_processing_days": round(avg_processing_time, 1) if avg_processing_time else 0,
            "unverified_documents": unverified_docs,
            "todays_appointments": total_appointments_today,
            "completed_today": completed_appointments_today,
            "completion_rate": round((completed_appointments_today / total_appointments_today * 100), 1) if total_appointments_today > 0 else 0
        }
    
    def generate_license_number(self, db: Session) -> str:
        """Generate unique license number in format A12-34-567890"""
        
        while True:
            # Generate format: Letter + 2 digits - 2 digits - 6 digits
            letter = random.choice(string.ascii_uppercase)
            first_two = random.randint(10, 99)
            second_two = random.randint(10, 99)
            last_six = random.randint(100000, 999999)
            
            license_number = f"{letter}{first_two}-{second_two}-{last_six}"
            
            # Check if this license number already exists
            existing = db.query(Applicant).filter(
                Applicant.license_number == license_number
            ).first()
            
            if not existing:
                return license_number

# Create instance
crud_admin = CRUDAdmin() 