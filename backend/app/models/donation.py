from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import text

if TYPE_CHECKING:
    from .applicant import Applicant

class Donation(Base):
    __tablename__ = "donation"
    
    # Auto-generated donation ID with format DON_001, DON_002, etc.
    donation_id = Column(
        String, 
        primary_key=True,
        server_default=text("'DON_' || lpad(nextval('donation_seq')::text, 3, '0')")
    )
    
    # Foreign Key
    applicant_id = Column(String, ForeignKey("applicant.applicant_id"), nullable=False)
    
    # Relationships
    applicant = relationship("Applicant", back_populates="donations")
    donation_organs = relationship("DonationOrgan", back_populates="donation")

class Organ(Base):
    __tablename__ = "organ"
    
    organ_type_id = Column(String, primary_key=True)
    organ_name = Column(Text, nullable=False)
    
    __table_args__ = (
        CheckConstraint(
            "organ_type_id ~ '^ORG_[A-Z]{3}$'",
            name="check_organ_type_id_format"
        ),
        CheckConstraint(
            "organ_name IN ('All', 'Kidneys', 'Heart', 'Cornea', 'Eyes', 'Pancreas', 'Liver', 'Lungs', 'Bones', 'Skin')",
            name="check_organ_name"
        ),
    )
    
    # Relationships
    donation_organs = relationship("DonationOrgan", back_populates="organ")

class DonationOrgan(Base):
    __tablename__ = "donationorgan"
    
    donation_id = Column(String, ForeignKey("donation.donation_id"), primary_key=True)
    organ_type_id = Column(String, ForeignKey("organ.organ_type_id"), primary_key=True)
    
    # Relationships
    donation = relationship("Donation", back_populates="donation_organs")
    organ = relationship("Organ", back_populates="donation_organs") 