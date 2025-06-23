from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.models.license_condition import LicenseCondition, LicenseConditionType

class CRUDLicenseCondition(CRUDBase[LicenseCondition, None, None]):
    def get_by_application(self, db: Session, *, application_id: str) -> List[LicenseCondition]:
        return db.query(LicenseCondition).options(
            joinedload(LicenseCondition.condition_type)
        ).filter(LicenseCondition.application_id == application_id).all()

crud_license_condition = CRUDLicenseCondition(LicenseCondition) 