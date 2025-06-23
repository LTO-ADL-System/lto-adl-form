from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.emergency import EmergencyContact
from app.schemas.emergency import EmergencyContactCreate

class CRUDEmergencyContact(CRUDBase[EmergencyContact, EmergencyContactCreate, None]):
    def get_by_applicant(self, db: Session, *, applicant_id: str) -> List[EmergencyContact]:
        return db.query(EmergencyContact).filter(
            EmergencyContact.applicant_id == applicant_id
        ).all()

crud_emergency = CRUDEmergencyContact(EmergencyContact) 