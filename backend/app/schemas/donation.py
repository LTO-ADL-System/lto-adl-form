# app/schemas/donation.py
from pydantic import BaseModel
from typing import List
from enum import Enum
from .base import BaseSchema

class OrganName(str, Enum):
    ALL = "All"
    KIDNEYS = "Kidneys"
    HEART = "Heart"
    CORNEA = "Cornea"
    EYES = "Eyes"
    PANCREAS = "Pancreas"
    LIVER = "Liver"
    LUNGS = "Lungs"
    BONES = "Bones"
    SKIN = "Skin"

class OrganResponse(BaseSchema):
    organ_type_id: str
    organ_name: OrganName

class DonationBase(BaseModel):
    organ_type_ids: List[str]  # List of organ type IDs to donate

class DonationCreate(DonationBase):
    applicant_id: str

class DonationResponse(BaseSchema):
    donation_id: str
    applicant_id: str
    organs: List[OrganResponse] = [] 