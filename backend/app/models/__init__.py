# app/models/__init__.py
from .applicant import Applicant
from .admin import Admin
from .application import (
    ApplicationStatus, 
    ApplicationType, 
    LicenseApplication, 
    ApplicationStatusHistory,
    ApplicationVehicleCategory
)
from .appointment import Appointment
from .document import SubmittedDocument
from .vehicle import VehicleCategory
from .family import FamilyInformation
from .employment import Employment
from .emergency import EmergencyContact
from .donation import Donation, DonationOrgan, Organ
from .location import Location
from .license_condition import LicenseCondition, LicenseConditionType
from .driving_skill import DrivingSkill
from .archived import ArchivedApplication
from .otp import EmailOTP, OTPType

__all__ = [
    "Applicant",
    "Admin",
    "ApplicationStatus",
    "ApplicationType", 
    "LicenseApplication",
    "ApplicationStatusHistory",
    "ApplicationVehicleCategory",
    "Appointment",
    "SubmittedDocument",
    "VehicleCategory",
    "FamilyInformation",
    "Employment",
    "EmergencyContact",
    "Donation",
    "DonationOrgan",
    "Organ",
    "Location",
    "LicenseCondition",
    "LicenseConditionType",
    "DrivingSkill",
    "ArchivedApplication",
    "EmailOTP",
    "OTPType"
]