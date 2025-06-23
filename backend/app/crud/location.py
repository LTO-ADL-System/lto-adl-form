# app/crud/location.py
from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.location import Location

class CRUDLocation(CRUDBase[Location, None, None]):
    def get_by_id(self, db: Session, *, location_id: str) -> Optional[Location]:
        return db.query(Location).filter(Location.location_id == location_id).first()
    
    def get_all(self, db: Session) -> List[Location]:
        return db.query(Location).order_by(Location.location_name).all()
    
    def search_by_name(self, db: Session, *, name: str) -> List[Location]:
        return db.query(Location).filter(
            Location.location_name.ilike(f"%{name}%")
        ).order_by(Location.location_name).all()

crud_location = CRUDLocation(Location) 