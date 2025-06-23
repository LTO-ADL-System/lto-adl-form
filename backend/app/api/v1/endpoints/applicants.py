# app/api/v1/endpoints/applicants.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_applicant, get_current_user_token, validate_pagination
from app.crud import crud_applicant, crud_family, crud_employment, crud_emergency, crud_donation
from app.models.applicant import Applicant
from app.schemas.applicant import ApplicantUpdate, ApplicantProfile
from app.schemas.family import FamilyInformationCreate, FamilyInformationResponse
from app.schemas.employment import EmploymentCreate, EmploymentResponse
from app.schemas.emergency import EmergencyContactCreate, EmergencyContactResponse
from app.schemas.donation import DonationCreate, DonationResponse
from app.schemas.response import ResponseModel, PaginatedResponse

router = APIRouter()

@router.get("/status", response_model=ResponseModel[dict])
async def get_my_status(
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_current_user_token)
):
    """Check authenticated user's status - whether they are an applicant or not"""
    
    user_email = user_data.get("email")
    user_uuid = user_data.get("id")
    
    if not user_email or not user_uuid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user data",
        )
    
    # Check if applicant record exists
    applicant = crud_applicant.get_by_uuid(db, user_uuid=user_uuid)
    
    if not applicant:
        applicant = crud_applicant.get_by_email(db, email=user_email)
    
    is_applicant = applicant is not None
    
    return ResponseModel(
        success=True,
        message="User status retrieved successfully",
        data={
            "user_id": user_uuid,
            "email": user_email,
            "is_applicant": is_applicant,
            "applicant_id": applicant.applicant_id if is_applicant else None,
            "message": "You can submit applications and manage your profile" if is_applicant 
                      else "Submit your first application to become an applicant"
        }
    )

@router.get("/me", response_model=ResponseModel[ApplicantProfile])
async def get_my_profile(
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Get current user's profile"""
    
    # Calculate age if birthdate exists
    age = None
    if current_applicant.birthdate:
        from datetime import date
        today = date.today()
        age = today.year - current_applicant.birthdate.year - (
            (today.month, today.day) < (current_applicant.birthdate.month, current_applicant.birthdate.day)
        )
    
    # Create profile response with computed fields
    profile_data = ApplicantProfile.from_orm(current_applicant)
    profile_data.age = age
    profile_data.full_name = f"{current_applicant.first_name} {current_applicant.family_name}"
    
    return ResponseModel(
        success=True,
        message="Profile retrieved successfully",
        data=profile_data
    )

@router.put("/me", response_model=ResponseModel[ApplicantProfile])
async def update_my_profile(
    applicant_update: ApplicantUpdate,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Update current user's profile"""
    
    updated_applicant = crud_applicant.update(
        db, db_obj=current_applicant, obj_in=applicant_update
    )
    
    return ResponseModel(
        success=True,
        message="Profile updated successfully",
        data=updated_applicant
    )

@router.post("/family", response_model=ResponseModel[FamilyInformationResponse])
async def add_family_information(
    family_data: FamilyInformationCreate,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Add family member information"""
    
    # Set applicant_id
    family_data.applicant_id = current_applicant.applicant_id
    
    # Check if family member with same relation already exists
    existing = crud_family.get_by_relation(
        db, 
        applicant_id=current_applicant.applicant_id,
        relation_type=family_data.relation_type
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Family member with relation '{family_data.relation_type}' already exists"
        )
    
    family_member = crud_family.create(db, obj_in=family_data)
    
    return ResponseModel(
        success=True,
        message="Family information added successfully",
        data=family_member
    )

@router.get("/family", response_model=ResponseModel[List[FamilyInformationResponse]])
async def get_my_family(
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Get current user's family information"""
    
    family_members = crud_family.get_by_applicant(
        db, applicant_id=current_applicant.applicant_id
    )
    
    return ResponseModel(
        success=True,
        message="Family information retrieved successfully",
        data=family_members
    )

@router.post("/employment", response_model=ResponseModel[EmploymentResponse])
async def add_employment(
    employment_data: EmploymentCreate,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Add employment information"""
    
    employment_data.applicant_id = current_applicant.applicant_id
    employment = crud_employment.create(db, obj_in=employment_data)
    
    return ResponseModel(
        success=True,
        message="Employment information added successfully",
        data=employment
    )

@router.get("/employment", response_model=ResponseModel[List[EmploymentResponse]])
async def get_my_employment(
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Get current user's employment history"""
    
    employment_history = crud_employment.get_by_applicant(
        db, applicant_id=current_applicant.applicant_id
    )
    
    return ResponseModel(
        success=True,
        message="Employment history retrieved successfully",
        data=employment_history
    )

@router.post("/emergency-contact", response_model=ResponseModel[EmergencyContactResponse])
async def add_emergency_contact(
    contact_data: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Add emergency contact"""
    
    contact_data.applicant_id = current_applicant.applicant_id
    emergency_contact = crud_emergency.create(db, obj_in=contact_data)
    
    return ResponseModel(
        success=True,
        message="Emergency contact added successfully",
        data=emergency_contact
    )

@router.get("/emergency-contacts", response_model=ResponseModel[List[EmergencyContactResponse]])
async def get_my_emergency_contacts(
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Get current user's emergency contacts"""
    
    contacts = crud_emergency.get_by_applicant(
        db, applicant_id=current_applicant.applicant_id
    )
    
    return ResponseModel(
        success=True,
        message="Emergency contacts retrieved successfully",
        data=contacts
    )

@router.post("/organ-donation", response_model=ResponseModel[DonationResponse])
async def register_organ_donation(
    donation_data: DonationCreate,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Register for organ donation"""
    
    # Check if already registered
    existing_donation = crud_donation.get_by_applicant(
        db, applicant_id=current_applicant.applicant_id
    )
    
    if existing_donation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organ donation already registered for this applicant"
        )
    
    # Create donation with organs
    donation = crud_donation.create_with_organs(
        db,
        applicant_id=current_applicant.applicant_id,
        organ_type_ids=donation_data.organ_type_ids
    )
    
    # Update applicant organ donor status
    crud_applicant.update(
        db,
        db_obj=current_applicant,
        obj_in={"is_organ_donor": True}
    )
    
    return ResponseModel(
        success=True,
        message="Organ donation registered successfully",
        data=donation
    )

@router.get("/organ-donation", response_model=ResponseModel[DonationResponse])
async def get_my_organ_donation(
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Get current user's organ donation information"""
    
    donation = crud_donation.get_by_applicant(
        db, applicant_id=current_applicant.applicant_id
    )
    
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organ donation registration found"
        )
    
    return ResponseModel(
        success=True,
        message="Organ donation information retrieved successfully",
        data=donation
    )