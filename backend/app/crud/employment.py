# app/crud/employment.py
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.crud.base import CRUDBase
from app.models.employment import Employment
from app.schemas.employment import EmploymentCreate

class CRUDEmployment(CRUDBase[Employment, EmploymentCreate, None]):
    def get_by_applicant(self, db: Session, *, applicant_id: str) -> List[Employment]:
        return db.query(Employment).filter(
            Employment.applicant_id == applicant_id
        ).all()
    
    def get_current_employment(self, db: Session, *, applicant_id: str) -> Optional[Employment]:
        """Get the most recent employment record"""
        return db.query(Employment).filter(
            Employment.applicant_id == applicant_id
        ).order_by(desc(Employment.employment_id)).first()

crud_employment = CRUDEmployment(Employment) 