# app/crud/donation.py
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.models.donation import Donation, Organ, DonationOrgan
from app.schemas.donation import DonationCreate

class CRUDDonation(CRUDBase[Donation, DonationCreate, None]):
    def get_by_applicant(self, db: Session, *, applicant_id: str) -> Optional[Donation]:
        return db.query(Donation).options(
            joinedload(Donation.donation_organs).joinedload(DonationOrgan.organ)
        ).filter(Donation.applicant_id == applicant_id).first()
    
    def create_with_organs(self, db: Session, *, applicant_id: str, organ_type_ids: List[str]) -> Donation:
        """Create donation record with specified organs"""
        # Create donation record
        donation = Donation(applicant_id=applicant_id)
        db.add(donation)
        db.flush()  # To get the donation_id
        
        # Add organ donations
        for organ_type_id in organ_type_ids:
            donation_organ = DonationOrgan(
                donation_id=donation.donation_id,
                organ_type_id=organ_type_id
            )
            db.add(donation_organ)
        
        db.commit()
        db.refresh(donation)
        return donation

class CRUDOrgan(CRUDBase[Organ, None, None]):
    def get_all(self, db: Session) -> List[Organ]:
        return db.query(Organ).all()
    
    def get_by_id(self, db: Session, *, organ_type_id: str) -> Optional[Organ]:
        return db.query(Organ).filter(Organ.organ_type_id == organ_type_id).first()

crud_donation = CRUDDonation(Donation)
crud_organ = CRUDOrgan(Organ) 