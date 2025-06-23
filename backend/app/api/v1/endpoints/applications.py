# app/api/v1/endpoints/applications.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import (
    get_db, 
    get_current_applicant, 
    get_current_user_token,
    get_application_owner,
    validate_pagination,

)
from app.crud import crud_application, crud_vehicle_category, crud_applicant, crud_family, crud_employment, crud_emergency, crud_document
from app.models.applicant import Applicant
from app.models.application import LicenseApplication
from app.schemas.application import (
    LicenseApplicationCreate, 
    LicenseApplicationResponse,
    ApplicationStatusHistoryResponse,
    CompleteApplicationCreate,
    CompleteApplicationResponse
)
from app.schemas.applicant import ApplicantCreate
from app.schemas.response import ResponseModel, PaginatedResponse

router = APIRouter()

@router.post("/submit-complete", response_model=ResponseModel[CompleteApplicationResponse])
async def submit_complete_application(
    application_data: CompleteApplicationCreate,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_current_user_token)
):
    """
    Submit a complete license application with all information at once.
    This creates or updates applicant profile, creates application, and processes all related data.
    """
    
    user_email = user_data.get("email")
    user_uuid = user_data.get("id")
    
    if not user_email or not user_uuid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user data",
        )
    
    try:
        # Start transaction
        db.begin()
        
        # 1. Create or update applicant profile
        current_applicant = crud_applicant.get_by_uuid(db, user_uuid=user_uuid)
        
        is_new_applicant = False
        if not current_applicant:
            # Check by email as fallback
            current_applicant = crud_applicant.get_by_email(db, email=user_email)
            
            if not current_applicant:
                # Create new applicant from personal info
                applicant_data = ApplicantCreate(
                    email=user_email,
                    uuid=user_uuid,
                    **application_data.personal_info.dict()
                )
                current_applicant = crud_applicant.create(db, obj_in=applicant_data)
                is_new_applicant = True
            else:
                # Update existing applicant with UUID and new info
                current_applicant.uuid = user_uuid
                # Update personal info
                for field, value in application_data.personal_info.dict().items():
                    if hasattr(current_applicant, field):
                        setattr(current_applicant, field, value)
                db.commit()
        else:
            # Update existing applicant with new personal info
            for field, value in application_data.personal_info.dict().items():
                if hasattr(current_applicant, field):
                    setattr(current_applicant, field, value)
            db.commit()
        
        # 2. Check for duplicate application type
        existing_applications = crud_application.get_by_applicant(
            db, applicant_id=current_applicant.applicant_id, skip=0, limit=100
        )
        
        # Check if user already has an application of this type
        for existing_app in existing_applications:
            if existing_app.application_type_id == application_data.application_type_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"You already have an application of type {application_data.application_type_id}. Only one application per type is allowed."
                )
        
        # 3. Validate vehicle categories exist
        for category_id in application_data.vehicle_categories:
            category = crud_vehicle_category.get_by_id(db, category_id=category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Vehicle category {category_id} not found"
                )
        
        # 4. Create application
        from app.models.application import LicenseApplication
        
        application = LicenseApplication(
            applicant_id=current_applicant.applicant_id,
            application_type_id=application_data.application_type_id,
            application_status_id="ASID_PEN",  # Default to Pending
            additional_requirements=application_data.additional_requirements
        )
        
        db.add(application)
        db.flush()  # Get the application_id
        
        # 5. Add vehicle categories
        from app.models.application import ApplicationVehicleCategory
        
        for i, category_id in enumerate(application_data.vehicle_categories):
            app_vehicle = ApplicationVehicleCategory(
                application_id=application.application_id,
                category_id=category_id,
                clutch_type=application_data.clutch_types[i]
            )
            db.add(app_vehicle)
        
        # 6. Create initial status history
        from app.models.application import ApplicationStatusHistory
        
        history = ApplicationStatusHistory(
            application_id=application.application_id,
            application_status_id="ASID_PEN",
            changed_by=current_applicant.applicant_id
        )
        db.add(history)
        
        # 7. Create driving skill record (required for all applications)
        from app.models.driving_skill import DrivingSkill
        
        # Default driving skill - can be customized based on application data
        driving_skill = DrivingSkill(
            application_id=application.application_id,
            acquisition_type="LTO-Accredited Driving School",  # Default, can be made configurable
            instructor_license=None  # Will be updated when actual skill assessment is done
        )
        db.add(driving_skill)
        
        # 8. Process emergency contacts
        emergency_contacts_created = 0
        if application_data.emergency_contacts:
            from app.schemas.emergency import EmergencyContactCreate
            for contact_data in application_data.emergency_contacts:
                contact_create = EmergencyContactCreate(
                    applicant_id=current_applicant.applicant_id,
                    **contact_data
                )
                crud_emergency.create(db, obj_in=contact_create)
                emergency_contacts_created += 1
        
        # 9. Process employment information
        employment_records_created = 0
        if application_data.employment_info:
            from app.schemas.employment import EmploymentCreate
            for emp_data in application_data.employment_info:
                emp_create = EmploymentCreate(
                    applicant_id=current_applicant.applicant_id,
                    **emp_data
                )
                crud_employment.create(db, obj_in=emp_create)
                employment_records_created += 1
        
        # 10. Process family information
        family_members_created = 0
        if application_data.family_info:
            from app.schemas.family import FamilyInformationCreate
            for family_data in application_data.family_info:
                family_create = FamilyInformationCreate(
                    applicant_id=current_applicant.applicant_id,
                    **family_data
                )
                crud_family.create(db, obj_in=family_create)
                family_members_created += 1
        
        # 11. Process documents (create document records, files will be uploaded separately)
        documents_processed = 0
        if application_data.documents:
            from app.schemas.document import DocumentCreate
            for doc_info in application_data.documents:
                doc_create = DocumentCreate(
                    application_id=application.application_id,
                    document_type=doc_info.document_name,  # Use document_name as document_type
                    file_url=doc_info.file_path or "pending_upload"  # Use file_path or default
                )
                crud_document.create(db, obj_in=doc_create)
                documents_processed += 1
        
        # 12. Handle organ donation if applicant is donor
        organ_donation_processed = False
        if current_applicant.is_organ_donor:
            from app.models.donation import Donation
            
            # Check if donation record already exists for this applicant
            existing_donation = db.query(Donation).filter(
                Donation.applicant_id == current_applicant.applicant_id
            ).first()
            
            if not existing_donation:
                # Create donation record
                donation = Donation(applicant_id=current_applicant.applicant_id)
                db.add(donation)
                db.flush()  # Get donation_id
                
                # Add default organ donation (can be customized later)
                from app.models.donation import DonationOrgan
                
                # Default to all organs - users can modify this later
                donation_organ = DonationOrgan(
                    donation_id=donation.donation_id,
                    organ_type_id="ORG_ALL"  # Assuming this exists in your Organ table
                )
                db.add(donation_organ)
                organ_donation_processed = True
        
        # 13. Update license details if provided (for renewal/duplicate)
        if application_data.license_details and application_data.license_details.existing_license_number:
            current_applicant.license_number = application_data.license_details.existing_license_number
            db.commit()
        
        # Commit all changes
        db.commit()
        db.refresh(application)
        
        # Prepare response
        app_count = len(crud_application.get_by_applicant(db, applicant_id=current_applicant.applicant_id, skip=0, limit=100))
        
        if is_new_applicant:
            message = f"Welcome! Your application has been submitted successfully. You are now a registered applicant."
        else:
            message = f"Application submitted successfully."
            if app_count == 1:
                message += " This is your first application."
        
        summary = {
            "is_new_applicant": is_new_applicant,
            "total_applications": app_count,
            "emergency_contacts_added": emergency_contacts_created,
            "employment_records_added": employment_records_created,
            "family_members_added": family_members_created,
            "documents_to_upload": documents_processed,
            "vehicle_categories": len(application_data.vehicle_categories),
            "driving_skill_created": True,
            "organ_donation_processed": organ_donation_processed
        }
        
        response_data = CompleteApplicationResponse(
            application_id=application.application_id,
            applicant_id=current_applicant.applicant_id,
            application_type_id=application.application_type_id,
            application_status_id=application.application_status_id,
            submission_date=application.submission_date,
            last_updated_date=application.last_updated_date,
            message=message,
            summary=summary
        )
        
        return ResponseModel(
            success=True,
            message=message,
            data=response_data
        )
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(e)}"
        )

# Keep the simple application endpoint for backward compatibility
@router.post("/", response_model=ResponseModel[LicenseApplicationResponse])
async def submit_application(
    application_data: LicenseApplicationCreate,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_current_user_token)
):
    """Submit a simple license application (legacy endpoint)"""
    
    user_email = user_data.get("email")
    user_uuid = user_data.get("id")
    
    if not user_email or not user_uuid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user data",
        )
    
    # Check if applicant already exists
    current_applicant = crud_applicant.get_by_uuid(db, user_uuid=user_uuid)
    
    if not current_applicant:
        # Check by email as fallback
        current_applicant = crud_applicant.get_by_email(db, email=user_email)
        
        if not current_applicant:
            # Create applicant record for first application submission
            from app.schemas.applicant import ApplicantCreate
            
            applicant_data = ApplicantCreate(
                email=user_email,
                uuid=user_uuid,
                # Set minimal defaults - they can update later via profile
                first_name="Not Set",
                family_name="Not Set",
                nationality="Filipino"
            )
            
            current_applicant = crud_applicant.create(db, obj_in=applicant_data)
        else:
            # Update existing applicant with UUID
            current_applicant.uuid = user_uuid
            db.commit()
    
    # Validate vehicle categories exist
    for category_id in application_data.vehicle_categories:
        category = crud_vehicle_category.get_by_id(db, category_id=category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle category {category_id} not found"
            )
    
    # Create application
    from app.models.application import LicenseApplication
    
    application = LicenseApplication(
        applicant_id=current_applicant.applicant_id,
        application_type_id=application_data.application_type_id,
        application_status_id="ASID_PEN",  # Default to Pending
        additional_requirements=application_data.additional_requirements
    )
    
    db.add(application)
    db.flush()  # Get the application_id
    
    # Add vehicle categories
    from app.models.application import ApplicationVehicleCategory
    
    for i, category_id in enumerate(application_data.vehicle_categories):
        app_vehicle = ApplicationVehicleCategory(
            application_id=application.application_id,
            category_id=category_id,
            clutch_type=application_data.clutch_types[i]
        )
        db.add(app_vehicle)
    
    # Create initial status history
    from app.models.application import ApplicationStatusHistory
    
    history = ApplicationStatusHistory(
        application_id=application.application_id,
        application_status_id="ASID_PEN",
        changed_by=current_applicant.applicant_id
    )
    db.add(history)
    
    db.commit()
    db.refresh(application)
    
    # Check if this was their first application (just became an applicant)
    app_count = len(crud_application.get_by_applicant(db, applicant_id=current_applicant.applicant_id, skip=0, limit=100))
    
    message = "Application submitted successfully"
    if app_count == 1:  # First application
        message = "Welcome! Your first application has been submitted. You are now a registered applicant."
    
    return ResponseModel(
        success=True,
        message=message,
        data=application
    )

@router.get("/", response_model=PaginatedResponse[LicenseApplicationResponse])
async def get_my_applications(
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant),
    pagination: tuple = Depends(validate_pagination)
):
    """Get current user's applications"""
    
    skip, limit = pagination
    
    applications = crud_application.get_by_applicant(
        db, 
        applicant_id=current_applicant.applicant_id,
        skip=skip,
        limit=limit
    )
    
    total = len(crud_application.get_by_applicant(db, applicant_id=current_applicant.applicant_id, skip=0, limit=1000))
    
    return PaginatedResponse(
        success=True,
        message="Applications retrieved successfully",
        data=applications,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/{application_id}", response_model=ResponseModel[LicenseApplicationResponse])
async def get_application(
    application: LicenseApplication = Depends(get_application_owner)
):
    """Get specific application by ID"""
    
    return ResponseModel(
        success=True,
        message="Application retrieved successfully",
        data=application
    )

@router.get("/{application_id}/history", response_model=ResponseModel[List[ApplicationStatusHistoryResponse]])
async def get_application_history(
    application: LicenseApplication = Depends(get_application_owner),
    db: Session = Depends(get_db)
):
    """Get application status history"""
    
    from app.crud.application import crud_application
    from app.models.application import ApplicationStatusHistory
    
    history = db.query(ApplicationStatusHistory).filter(
        ApplicationStatusHistory.application_id == application.application_id
    ).order_by(ApplicationStatusHistory.status_change_date).all()
    
    return ResponseModel(
        success=True,
        message="Application history retrieved successfully",
        data=history
    )

@router.get("/{application_id}/required-documents", response_model=ResponseModel[dict])
async def get_required_documents_status(
    application: LicenseApplication = Depends(get_application_owner),
    db: Session = Depends(get_db)
):
    """Get status of required documents for application"""
    
    from app.crud import crud_document
    
    doc_status = crud_document.get_required_documents_status(
        db, application_id=application.application_id
    )
    
    return ResponseModel(
        success=True,
        message="Required documents status retrieved successfully",
        data=doc_status
    )