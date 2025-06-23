from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.driving_skill import DrivingSkill

class CRUDDrivingSkill(CRUDBase[DrivingSkill, None, None]):
    def get_by_application(self, db: Session, *, application_id: str) -> List[DrivingSkill]:
        return db.query(DrivingSkill).filter(
            DrivingSkill.application_id == application_id
        ).all()
    
    def get_by_acquisition_type(self, db: Session, *, acquisition_type: str) -> List[DrivingSkill]:
        return db.query(DrivingSkill).filter(
            DrivingSkill.acquisition_type == acquisition_type
        ).all()

crud_driving_skill = CRUDDrivingSkill(DrivingSkill) 