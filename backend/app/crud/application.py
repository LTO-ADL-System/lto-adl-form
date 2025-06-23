from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_
from datetime import datetime, timedelta
from app.crud.base import CRUDBase
from app.models.application import (
    LicenseApplication, 
    ApplicationStatus, 
    ApplicationType,
    ApplicationStatusHistory,
    ApplicationVehicleCategory
)
from app.schemas.application import (
    LicenseApplicationCreate, 
    LicenseApplicationUpdate
)

class CRUDLicenseApplication(CRUDBase[LicenseApplication, LicenseApplicationCreate, LicenseApplicationUpdate]):
    def get_by_id(self, db: Session, *, application_id: str) -> Optional[LicenseApplication]:
        return db.query(LicenseApplication).options(
            joinedload(LicenseApplication.applicant),
            joinedload(LicenseApplication.application_type),
            joinedload(LicenseApplication.status),
            joinedload(LicenseApplication.vehicle_categories)
        ).filter(LicenseApplication.application_id == application_id).first()
    
    def get_by_applicant(self, db: Session, *, applicant_id: str, skip: int = 0, limit: int = 100) -> List[LicenseApplication]:
        return db.query(LicenseApplication).options(
            joinedload(LicenseApplication.application_type),
            joinedload(LicenseApplication.status)
        ).filter(
            LicenseApplication.applicant_id == applicant_id
        ).order_by(desc(LicenseApplication.submission_date)).offset(skip).limit(limit).all()
    
    def get_by_status(self, db: Session, *, status_id: str, skip: int = 0, limit: int = 100) -> List[LicenseApplication]:
        return db.query(LicenseApplication).options(
            joinedload(LicenseApplication.applicant),
            joinedload(LicenseApplication.application_type)
        ).filter(
            LicenseApplication.application_status_id == status_id
        ).order_by(desc(LicenseApplication.submission_date)).offset(skip).limit(limit).all()
    
    def get_pending_applications(self, db: Session, skip: int = 0, limit: int = 100) -> List[LicenseApplication]:
        """Get all pending applications"""
        return db.query(LicenseApplication).options(
            joinedload(LicenseApplication.applicant),
            joinedload(LicenseApplication.application_type)
        ).filter(
            LicenseApplication.application_status_id.in_(["ASID_PEN", "ASID_REV"])
        ).order_by(LicenseApplication.submission_date).offset(skip).limit(limit).all()
    
    def get_applications_by_date_range(
        self, 
        db: Session, 
        *, 
        start_date: datetime, 
        end_date: datetime,
        skip: int = 0, 
        limit: int = 100
    ) -> List[LicenseApplication]:
        return db.query(LicenseApplication).options(
            joinedload(LicenseApplication.applicant),
            joinedload(LicenseApplication.application_type),
            joinedload(LicenseApplication.status)
        ).filter(
            and_(
                LicenseApplication.submission_date >= start_date,
                LicenseApplication.submission_date <= end_date
            )
        ).order_by(desc(LicenseApplication.submission_date)).offset(skip).limit(limit).all()
    
    def get_todays_applications(self, db: Session) -> List[LicenseApplication]:
        """Get applications submitted today"""
        today = datetime.now().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())
        
        return self.get_applications_by_date_range(
            db, start_date=start_of_day, end_date=end_of_day
        )
    
    def update_status(
        self, 
        db: Session, 
        *, 
        application_id: str, 
        new_status_id: str, 
        changed_by: str,
        rejection_reason: Optional[str] = None
    ) -> Optional[LicenseApplication]:
        """Update application status and create history record"""
        application = self.get_by_id(db, application_id=application_id)
        if not application:
            return None
        
        # Update application status
        old_status_id = application.application_status_id
        application.application_status_id = new_status_id
        if rejection_reason:
            application.rejection_reason = rejection_reason
        
        # Create status history record
        from app.models.application import ApplicationStatusHistory
        history = ApplicationStatusHistory(
            application_id=application_id,
            application_status_id=new_status_id,
            changed_by=changed_by
        )
        db.add(history)
        db.commit()
        db.refresh(application)
        return application
    
    def get_statistics(self, db: Session) -> dict:
        """Get application statistics"""
        total = db.query(LicenseApplication).count()
        pending = db.query(LicenseApplication).filter(
            LicenseApplication.application_status_id == "ASID_PEN"
        ).count()
        approved = db.query(LicenseApplication).filter(
            LicenseApplication.application_status_id == "ASID_APP"
        ).count()
        rejected = db.query(LicenseApplication).filter(
            LicenseApplication.application_status_id == "ASID_REJ"
        ).count()
        
        today = datetime.now().date()
        today_count = db.query(LicenseApplication).filter(
            LicenseApplication.submission_date >= today
        ).count()
        
        return {
            "total_applications": total,
            "pending_applications": pending,
            "approved_applications": approved,
            "rejected_applications": rejected,
            "applications_today": today_count
        }

class CRUDApplicationStatus(CRUDBase[ApplicationStatus, None, None]):
    def get_by_id(self, db: Session, *, status_id: str) -> Optional[ApplicationStatus]:
        return db.query(ApplicationStatus).filter(ApplicationStatus.application_status_id == status_id).first()
    
    def get_all(self, db: Session) -> List[ApplicationStatus]:
        return db.query(ApplicationStatus).all()

class CRUDApplicationType(CRUDBase[ApplicationType, None, None]):
    def get_by_id(self, db: Session, *, type_id: str) -> Optional[ApplicationType]:
        return db.query(ApplicationType).filter(ApplicationType.application_type_id == type_id).first()
    
    def get_all(self, db: Session) -> List[ApplicationType]:
        return db.query(ApplicationType).all()
    
    def get_by_category(self, db: Session, *, category: str) -> List[ApplicationType]:
        return db.query(ApplicationType).filter(ApplicationType.type_category == category).all()

crud_application = CRUDLicenseApplication(LicenseApplication)
crud_application_status = CRUDApplicationStatus(ApplicationStatus)
crud_application_type = CRUDApplicationType(ApplicationType)
