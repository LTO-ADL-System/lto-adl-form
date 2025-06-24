from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import date, timedelta
from uuid import UUID
from app.crud.base import CRUDBase
from app.models.applicant import Applicant
from app.schemas.applicant import ApplicantCreate, ApplicantUpdate, MinimalApplicantCreate
from app.core.security import get_password_hash, verify_password

class CRUDApplicant(CRUDBase[Applicant, ApplicantCreate, ApplicantUpdate]):
    def get_by_uuid(self, db: Session, *, user_uuid: str) -> Optional[Applicant]:
        """Get applicant by Supabase UUID (primary key)"""
        from uuid import UUID
        if isinstance(user_uuid, str):
            user_uuid = UUID(user_uuid)
        return db.query(Applicant).filter(Applicant.uuid == user_uuid).first()

    def get_by_email(self, db: Session, *, email: str) -> Optional[Applicant]:
        """Get applicant by email"""
        return db.query(Applicant).filter(Applicant.email == email).first()

    def update_uuid(self, db: Session, *, applicant: Applicant, user_uuid: str) -> Applicant:
        """Update applicant with Supabase UUID"""
        applicant.uuid = user_uuid
        db.add(applicant)
        db.commit()
        db.refresh(applicant)
        return applicant
    
    def get_by_contact(self, db: Session, *, contact_num: str) -> Optional[Applicant]:
        return db.query(Applicant).filter(Applicant.contact_num == contact_num).first()
    
    def get_by_license_number(self, db: Session, *, license_number: str) -> Optional[Applicant]:
        return db.query(Applicant).filter(Applicant.license_number == license_number).first()
    
    def get_by_tin(self, db: Session, *, tin: str) -> Optional[Applicant]:
        """Get applicant by TIN (Tax Identification Number)"""
        return db.query(Applicant).filter(Applicant.tin == tin).first()
    
    def create_minimal(self, db: Session, *, obj_in: MinimalApplicantCreate, uuid: UUID) -> Applicant:
        """Create minimal applicant profile for initial registration"""
        db_obj = Applicant(
            uuid=uuid,
            email=obj_in.email,
            family_name=obj_in.family_name,
            first_name=obj_in.first_name,
            middle_name=obj_in.middle_name,
            address=obj_in.address,
            contact_num=obj_in.contact_num,
            nationality=obj_in.nationality,
            birthdate=obj_in.birthdate,
            birthplace=obj_in.birthplace,
            height=obj_in.height,
            weight=obj_in.weight,
            eye_color=obj_in.eye_color,
            civil_status=obj_in.civil_status.value if obj_in.civil_status else None,
            educational_attainment=obj_in.educational_attainment.value if obj_in.educational_attainment else None,
            blood_type=obj_in.blood_type.value if obj_in.blood_type else None,
            sex=obj_in.sex.value if obj_in.sex else None,
            tin=obj_in.tin,  # Add TIN field
            is_organ_donor=obj_in.is_organ_donor
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def search(self, db: Session, *, query: str, skip: int = 0, limit: int = 100) -> List[Applicant]:
        """Search applicants by name, contact number, email, license number, or TIN"""
        search_filter = or_(
            Applicant.first_name.ilike(f"%{query}%"),
            Applicant.family_name.ilike(f"%{query}%"),
            Applicant.contact_num.ilike(f"%{query}%"),
            Applicant.email.ilike(f"%{query}%"),
            Applicant.license_number.ilike(f"%{query}%"),
            Applicant.tin.ilike(f"%{query}%")  # Add TIN to search
        )
        return db.query(Applicant).filter(search_filter).offset(skip).limit(limit).all()
    
    def get_applicants_by_age_range(self, db: Session, *, min_age: int, max_age: int) -> List[Applicant]:
        """Get applicants within age range"""
        today = date.today()
        min_birth_date = today - timedelta(days=max_age * 365.25)
        max_birth_date = today - timedelta(days=min_age * 365.25)
        
        return db.query(Applicant).filter(
            Applicant.birthdate >= min_birth_date,
            Applicant.birthdate <= max_birth_date
        ).all()
    
    def get_organ_donors(self, db: Session, skip: int = 0, limit: int = 100) -> List[Applicant]:
        """Get all organ donors"""
        return db.query(Applicant).filter(
            Applicant.is_organ_donor == True
        ).offset(skip).limit(limit).all()
    
    def get_by_applicant_id(self, db: Session, *, applicant_id: str) -> Optional[Applicant]:
        """Get applicant by applicant_id (not the primary key)"""
        return db.query(Applicant).filter(Applicant.applicant_id == applicant_id).first()
    
    def update_license_number(self, db: Session, *, applicant_id: str, license_number: str) -> Optional[Applicant]:
        """Update applicant's license number"""
        applicant = self.get_by_applicant_id(db, applicant_id=applicant_id)
        if applicant:
            applicant.license_number = license_number
            db.commit()
            db.refresh(applicant)
        return applicant

crud_applicant = CRUDApplicant(Applicant)
