# app/crud/vehicle.py
from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.vehicle import VehicleCategory
from app.models.application import ApplicationVehicleCategory

class CRUDVehicleCategory(CRUDBase[VehicleCategory, None, None]):
    def get_by_id(self, db: Session, *, category_id: str) -> Optional[VehicleCategory]:
        return db.query(VehicleCategory).filter(VehicleCategory.category_id == category_id).first()
    
    def get_all(self, db: Session) -> List[VehicleCategory]:
        return db.query(VehicleCategory).all()
    
    def get_by_type(self, db: Session, *, vehicle_type: str) -> List[VehicleCategory]:
        return db.query(VehicleCategory).filter(VehicleCategory.vehicle_type == vehicle_type).all()
    
    def get_light_vehicles(self, db: Session) -> List[VehicleCategory]:
        return self.get_by_type(db, vehicle_type="Light")
    
    def get_heavy_vehicles(self, db: Session) -> List[VehicleCategory]:
        return self.get_by_type(db, vehicle_type="Heavy")

crud_vehicle_category = CRUDVehicleCategory(VehicleCategory) 