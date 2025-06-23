# app/models/applicant.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, Date, Numeric, Boolean, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from .base import Base, TimestampMixin
import uuid

if TYPE_CHECKING:
    from .application import LicenseApplication
    from .family import FamilyInformation
    from .emergency import EmergencyContact
    from .employment import Employment
    from .donation import Donation

class Applicant(Base, TimestampMixin):
    __tablename__ = "applicant"
    
    # Primary key
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Auto-generated applicant ID with format APP_001, APP_002, etc.
    applicant_id = Column(
        String, 
        unique=True, 
        server_default=text("'APP_' || lpad(nextval('applicant_seq')::text, 3, '0')")
    )
    
    # Email - required for registration
    email = Column(String, nullable=False, unique=True)
    
    # Profile completion status
    profile_completed = Column(Boolean, default=False)
    
    # Personal Information - now nullable for initial registration
    family_name = Column(String, nullable=True, default="Not Set")
    first_name = Column(String, nullable=True, default="Not Set")
    middle_name = Column(String, nullable=True)
    address = Column(String, nullable=True, default="Not Set")
    contact_num = Column(String, nullable=True, default="+63XXXXXXXXXX")
    nationality = Column(String, nullable=True, default="Filipino")
    birthdate = Column(Date, nullable=True)
    birthplace = Column(String, nullable=True, default="Not Set")
    height = Column(Numeric, nullable=True, default=170.0)
    weight = Column(Numeric, nullable=True, default=70.0)
    eye_color = Column(Text, nullable=True, default="Brown")
    
    # Enums and constraints - nullable for initial registration
    civil_status = Column(Text, nullable=True, default="Single")
    educational_attainment = Column(Text, nullable=True, default="College")
    blood_type = Column(Text, nullable=True, default="O+")
    sex = Column(Text, nullable=True, default="Male")
    
    # Optional fields
    license_number = Column(String)
    is_organ_donor = Column(Boolean, default=False)
    
    # Note: Authentication is handled by Supabase Auth
    # The uuid field references auth.users(id)
    
    # Foreign key to auth.users
    # Note: This assumes Supabase auth integration
    
    # Constraints - updated to handle nullable fields
    __table_args__ = (
        CheckConstraint(
            "civil_status IS NULL OR civil_status IN ('Married', 'Single', 'Widowed', 'Separated')",
            name="check_civil_status"
        ),
        CheckConstraint(
            "educational_attainment IS NULL OR educational_attainment IN ('Postgraduate', 'College', 'High School', 'Elementary')",
            name="check_educational_attainment"
        ),
        CheckConstraint(
            "blood_type IS NULL OR blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')",
            name="check_blood_type"
        ),
        CheckConstraint(
            "sex IS NULL OR sex IN ('Male', 'Female', 'Other')",
            name="check_sex"
        ),
        CheckConstraint(
            "contact_num IS NULL OR contact_num ~ '^\\+63\\d{10}$'",
            name="check_contact_num_format"
        ),
        CheckConstraint(
            "license_number IS NULL OR license_number ~ '^[A-Z]{1}[0-9]{2}-[0-9]{2}-[0-9]{6}$'",
            name="check_license_number_format"
        ),
        CheckConstraint(
            "height IS NULL OR (height >= 0 AND height <= 300)",
            name="check_height_range"
        ),
        CheckConstraint(
            "weight IS NULL OR (weight >= 0 AND weight <= 500)",
            name="check_weight_range"
        ),
    )
    
    # Relationships
    license_applications = relationship("LicenseApplication", back_populates="applicant")
    family_information = relationship("FamilyInformation", back_populates="applicant")
    emergency_contacts = relationship("EmergencyContact", back_populates="applicant")
    employment = relationship("Employment", back_populates="applicant")
    donations = relationship("Donation", back_populates="applicant")
