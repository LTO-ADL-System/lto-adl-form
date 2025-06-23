# app/crud/family.py
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.crud.base import CRUDBase
from app.models.family import FamilyInformation
from app.schemas.family import FamilyInformationCreate

class CRUDFamilyInformation(CRUDBase[FamilyInformation, FamilyInformationCreate, None]):
    def get_by_applicant(self, db: Session, *, applicant_id: str) -> List[FamilyInformation]:
        return db.query(FamilyInformation).filter(
            FamilyInformation.applicant_id == applicant_id
        ).all()
    
    def get_by_relation(self, db: Session, *, applicant_id: str, relation_type: str) -> Optional[FamilyInformation]:
        return db.query(FamilyInformation).filter(
            and_(
                FamilyInformation.applicant_id == applicant_id,
                FamilyInformation.relation_type == relation_type
            )
        ).first()
    
    def get_living_family_members(self, db: Session, *, applicant_id: str) -> List[FamilyInformation]:
        return db.query(FamilyInformation).filter(
            and_(
                FamilyInformation.applicant_id == applicant_id,
                FamilyInformation.is_deceased == False
            )
        ).all()

crud_family = CRUDFamilyInformation(FamilyInformation) 