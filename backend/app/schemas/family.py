# app/schemas/family.py
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from .base import BaseSchema

class RelationType(str, Enum):
    MOTHER = "Mother"
    FATHER = "Father"
    SPOUSE = "Spouse"

class FamilyInformationBase(BaseModel):
    relation_type: RelationType
    family_name: str
    first_name: str
    middle_name: Optional[str] = None
    is_deceased: bool = False

class FamilyInformationCreate(FamilyInformationBase):
    applicant_id: str

class FamilyInformationResponse(FamilyInformationBase, BaseSchema):
    family_info_id: str
    applicant_id: str 