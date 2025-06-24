# app/api/v1/endpoints/applications.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, Body
from sqlalchemy.orm import Session
import logging
import json
from pydantic import ValidationError

# Configure logging
logger = logging.getLogger(__name__)

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
    raw_data: dict = Body(...),
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_current_user_token)
):
    """
    Submit a complete license application with all information at once.
    This creates or updates applicant profile, creates application, and processes all related data.
    """
    
    logger.info("=== SUBMIT COMPLETE APPLICATION START ===")
    logger.info(f"User data: {user_data}")
    logger.info(f"Raw data received: {json.dumps(raw_data, indent=2, default=str)}")
    
    # Parse and validate the application data manually to catch validation errors
    application_data = None
    try:
        logger.info("Attempting to parse application data...")
        application_data = CompleteApplicationCreate(**raw_data)
        logger.info(f"Application data parsed successfully: {application_data.dict()}")
    except ValidationError as ve:
        logger.error(f"Pydantic validation error: {ve}")
        logger.error(f"Validation errors: {ve.errors()}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {ve.errors()}"
        )
    except Exception as e:
        logger.error(f"Error parsing application data: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing request: {str(e)}"
        )
    
    user_email = user_data.get("email")
    user_uuid = user_data.get("id")
    
    logger.info(f"User email: {user_email}, User UUID: {user_uuid}")
    
    if not user_email or not user_uuid:
        logger.error("Missing user email or UUID")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user data",
        )
    
    try:
        # Start transaction
        logger.info("Starting database transaction")
        
        # 1. Get or identify applicant (READ-ONLY first)
        logger.info("Step 1: Identifying applicant")
        current_applicant = crud_applicant.get_by_uuid(db, user_uuid=user_uuid)
        
        if not current_applicant:
            logger.info("Applicant not found by UUID, checking by email")
            # Check by email as fallback
            current_applicant = crud_applicant.get_by_email(db, email=user_email)
        
        # 2. Check for duplicate application type FIRST (before any writes)
        logger.info("Step 2: Checking for duplicate applications")
        if current_applicant:
            existing_applications = crud_application.get_by_applicant(
                db, applicant_id=current_applicant.applicant_id, skip=0, limit=100
            )
        else:
            existing_applications = []  # New applicant, no existing applications
        
        # Smart duplicate check based on business rules
        for existing_app in existing_applications:
            if existing_app.application_type_id == application_data.application_type_id:
                # Business Rule 1: If applicant was rejected, they can reapply
                if existing_app.application_status_id == "ASID_REJ":
                    logger.info(f"Previous application was rejected. Allowing reapplication for type: {application_data.application_type_id}")
                    continue  # Allow reapplication
                
                # Business Rule 2: If applicant has pending/in-progress application, block new submission
                if existing_app.application_status_id in ["ASID_PEN", "ASID_SFA", "ASID_RSB"]:
                    logger.warning(f"Active application exists for type: {application_data.application_type_id}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"You already have an active application of type {application_data.application_type_id}. Please wait for it to be processed or complete it first."
                    )
                
                # Business Rule 3: If applicant has approved application, check specific rules
                if existing_app.application_status_id == "ASID_APR":
                    # For renewals (ATID_B) - allowed if existing license is about to expire
                    if application_data.application_type_id == "ATID_B":
                        # Check if license is about to expire (within 60 days or already expired)
                        if application_data.license_details and application_data.license_details.license_expiry_date:
                            from datetime import datetime, timedelta
                            expiry_date = application_data.license_details.license_expiry_date
                            sixty_days_from_now = datetime.now().date() + timedelta(days=60)
                            
                            if expiry_date <= sixty_days_from_now:
                                logger.info(f"License expires soon ({expiry_date}). Allowing renewal application.")
                                continue  # Allow renewal
                            else:
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail=f"Your license is not yet eligible for renewal. License expires on {expiry_date}. You can renew 60 days before expiry."
                                )
                        else:
                            logger.info("No expiry date provided. Allowing renewal application.")
                            continue  # Allow renewal if no expiry date provided
                    
                    # For duplicates (ATID_D) - allowed anytime (due to loss, damage, theft)
                    elif application_data.application_type_id == "ATID_D":
                        logger.info("Duplicate license application. Allowing due to potential loss/damage/theft.")
                        continue  # Allow duplicate
                    
                    # For new applications (ATID_A) - generally not allowed if already approved
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"You already have an approved {application_data.application_type_id} application. New applications are only allowed for first-time applicants."
                        )
        
        # 3. Validate vehicle categories exist (before any database writes)
        logger.info("Step 3: Validating vehicle categories")
        logger.info(f"Vehicle categories to validate: {application_data.vehicle_categories}")
        for category_id in application_data.vehicle_categories:
            category = crud_vehicle_category.get_by_id(db, category_id=category_id)
            if not category:
                logger.error(f"Vehicle category not found: {category_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Vehicle category {category_id} not found"
                )
        
        # Now start the actual database transaction after all validations pass
        logger.info("All validations passed. Starting database transaction.")
        
        # 4. Create or update applicant profile (now that validations passed)
        logger.info("Step 4: Creating/updating applicant profile")
        is_new_applicant = False
        if not current_applicant:
            logger.info("Creating new applicant")
            logger.info(f"Personal info for new applicant: {application_data.personal_info.dict()}")
            # Create new applicant from personal info
            applicant_data = ApplicantCreate(
                email=user_email,
                uuid=user_uuid,
                **application_data.personal_info.dict()
            )
            logger.info(f"Applicant data to create: {applicant_data.dict()}")
            current_applicant = crud_applicant.create(db, obj_in=applicant_data)
            is_new_applicant = True
        else:
            logger.info("Updating existing applicant")
            # Update existing applicant with UUID and new info
            if not current_applicant.uuid:
                current_applicant.uuid = user_uuid
            # Update personal info
            for field, value in application_data.personal_info.dict().items():
                if hasattr(current_applicant, field):
                    setattr(current_applicant, field, value)
            # Don't commit yet - will commit everything at the end
        
        logger.info(f"Applicant processed: {current_applicant.applicant_id}")
        
        # 5. Create application
        logger.info("Step 5: Creating application")
        from app.models.application import LicenseApplication
        
        application = LicenseApplication(
            applicant_id=current_applicant.applicant_id,
            application_type_id=application_data.application_type_id,
            application_status_id="ASID_PEN",  # Default to Pending
            additional_requirements=application_data.additional_requirements
        )
        
        db.add(application)
        db.flush()  # Get the application_id
        logger.info(f"Application created with ID: {application.application_id}")
        
        # 6. Add vehicle categories
        logger.info("Step 6: Adding vehicle categories")
        from app.models.application import ApplicationVehicleCategory
        
        for i, category_id in enumerate(application_data.vehicle_categories):
            clutch_type = application_data.clutch_types[i] if i < len(application_data.clutch_types) else "Manual"
            logger.info(f"Adding vehicle category: {category_id} with clutch type: {clutch_type}")
            app_vehicle = ApplicationVehicleCategory(
                application_id=application.application_id,
                category_id=category_id,
                clutch_type=clutch_type
            )
            db.add(app_vehicle)
        
        # 7. Create initial status history
        from app.models.application import ApplicationStatusHistory
        
        history = ApplicationStatusHistory(
            application_id=application.application_id,
            application_status_id="ASID_PEN",
            changed_by=current_applicant.applicant_id
        )
        db.add(history)
        
        # 8. Create driving skill record (required for all applications)
        from app.models.driving_skill import DrivingSkill
        
        # Determine acquisition type from the application data
        acquisition_type = "LTO-Accredited Driving School"  # Default
        
        # Map frontend driving skill values to backend values
        if hasattr(application_data, 'additional_data') and application_data.additional_data:
            frontend_skill = application_data.additional_data.get('drivingSkill')
            if frontend_skill == 'driving_school':
                acquisition_type = "LTO-Accredited Driving School"
            elif frontend_skill == 'tesda':
                acquisition_type = "TESDA"
            elif frontend_skill == 'private':
                acquisition_type = "Private Licensed Person"
        
        driving_skill = DrivingSkill(
            application_id=application.application_id,
            acquisition_type=acquisition_type,
            instructor_license=None  # Will be updated when actual skill assessment is done
        )
        db.add(driving_skill)
        
        # 8a. Create license conditions if specified
        if hasattr(application_data, 'additional_data') and application_data.additional_data:
            frontend_conditions = application_data.additional_data.get('conditions')
            logger.info(f"Processing conditions: {frontend_conditions} (type: {type(frontend_conditions)})")
            
            if frontend_conditions:
                # Handle both single string and list inputs
                conditions_list = []
                if isinstance(frontend_conditions, list):
                    conditions_list = frontend_conditions
                elif isinstance(frontend_conditions, str):
                    conditions_list = [frontend_conditions]
                
                # Filter out 'none' conditions
                conditions_list = [c for c in conditions_list if c and c != 'none']
                
                if conditions_list:
                    from app.models.license_condition import LicenseCondition
                    
                    # Map frontend condition values to backend condition type IDs
                    condition_mapping = {
                        'corrective-lenses': 'CTID_001',  # Assuming these exist in your LicenseConditionType table
                        'hearing-aid': 'CTID_002',
                        'prosthetic-device': 'CTID_003'
                    }
                    
                    for condition in conditions_list:
                        if condition in condition_mapping:
                            license_condition = LicenseCondition(
                                application_id=application.application_id,
                                condition_type_id=condition_mapping[condition]
                            )
                            db.add(license_condition)
                            logger.info(f"Added license condition: {condition} -> {condition_mapping[condition]}")
                        else:
                            logger.warning(f"Unknown condition type: {condition}")
                else:
                    logger.info("No license conditions to process (all were 'none')")
            else:
                logger.info("No conditions provided in additional_data")
        
        # 9. Process emergency contacts
        emergency_contacts_created = 0
        if application_data.emergency_contacts:
            from app.schemas.emergency import EmergencyContactCreate
            for contact_data in application_data.emergency_contacts:
                # The frontend sends the data with correct field names, so no mapping needed
                contact_create = EmergencyContactCreate(
                    applicant_id=current_applicant.applicant_id,
                    **contact_data
                )
                crud_emergency.create(db, obj_in=contact_create)
                emergency_contacts_created += 1
        
        # 10. Process employment information
        employment_records_created = 0
        if application_data.employment_info:
            from app.schemas.employment import EmploymentCreate
            for emp_data in application_data.employment_info:
                # Map frontend field names to backend schema field names
                mapped_emp_data = {
                    'employer_name': emp_data.get('employer_business_name', ''),
                    'employer_tel_no': emp_data.get('employer_telephone', ''),
                    'employer_address': emp_data.get('employer_address', '')
                }
                logger.info(f"Creating employment record with mapped data: {mapped_emp_data}")
                emp_create = EmploymentCreate(
                    applicant_id=current_applicant.applicant_id,
                    **mapped_emp_data
                )
                crud_employment.create(db, obj_in=emp_create)
                employment_records_created += 1
        
        # 11. Process family information
        family_members_created = 0
        if application_data.family_info:
            from app.schemas.family import FamilyInformationCreate
            for family_data in application_data.family_info:
                # Frontend sends correct field names, no mapping needed
                logger.info(f"Creating family record with data: {family_data}")
                family_create = FamilyInformationCreate(
                    applicant_id=current_applicant.applicant_id,
                    **family_data
                )
                crud_family.create(db, obj_in=family_create)
                family_members_created += 1
        
        # 12. Process documents (create document records, files will be uploaded separately)
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
        
        # 13. Handle organ donation if applicant is donor
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
                
                # Determine which organs to donate
                organs_to_donate = ["ORG_ALL"]  # Default to all organs
                
                # Check if specific organs were provided
                if hasattr(application_data, 'additional_data') and application_data.additional_data:
                    frontend_organs = application_data.additional_data.get('organs')
                    logger.info(f"Processing organs: {frontend_organs} (type: {type(frontend_organs)})")
                    
                    if frontend_organs and frontend_organs != 'all':
                        # Handle both single string and list inputs
                        organs_list = []
                        if isinstance(frontend_organs, list):
                            organs_list = frontend_organs
                        elif isinstance(frontend_organs, str):
                            organs_list = [frontend_organs]
                        
                        # Filter out 'all' entries (redundant since we already check != 'all')
                        organs_list = [o for o in organs_list if o and o != 'all']
                        
                        if organs_list:
                            # Map frontend organ values to backend organ type IDs
                            organ_mapping = {
                                'kidney': 'ORG_KID',
                                'heart': 'ORG_HRT', 
                                'cornea': 'ORG_COR',
                                'eyes': 'ORG_EYE',
                                'pancreas': 'ORG_PAN',
                                'liver': 'ORG_LIV',
                                'lungs': 'ORG_LUN',
                                'bones': 'ORG_BON',
                                'skin': 'ORG_SKN'
                            }
                            
                            organs_to_donate = []
                            for organ in organs_list:
                                if organ in organ_mapping:
                                    organs_to_donate.append(organ_mapping[organ])
                                    logger.info(f"Added organ donation: {organ} -> {organ_mapping[organ]}")
                                else:
                                    logger.warning(f"Unknown organ type: {organ}")
                            
                            # If no valid organs found, default to all
                            if not organs_to_donate:
                                organs_to_donate = ["ORG_ALL"]
                                logger.info("No valid organs found, defaulting to all organs")
                
                # Add organ donation records
                from app.models.donation import DonationOrgan
                for organ_type_id in organs_to_donate:
                    donation_organ = DonationOrgan(
                        donation_id=donation.donation_id,
                        organ_type_id=organ_type_id
                    )
                    db.add(donation_organ)
                
                organ_donation_processed = True
        
        # 14. Update license details if provided (for renewal/duplicate)
        if application_data.license_details and application_data.license_details.existing_license_number:
            license_number = application_data.license_details.existing_license_number.strip()
            
            # Validate license number format: A12-34-567890 (exactly 6 digits at the end)
            import re
            if not re.match(r'^[A-Z]{1}[0-9]{2}-[0-9]{2}-[0-9]{6}$', license_number):
                logger.warning(f"Invalid license number format: {license_number}. Expected format: A12-34-567890")
                # For now, don't set the license number if it's invalid
                # In production, you might want to raise an error or fix the format
                logger.info("Skipping license number update due to invalid format")
            else:
                current_applicant.license_number = license_number
                logger.info(f"Updated license number: {license_number}")
            # Don't commit yet - will commit everything at the end
        
        # Commit all changes
        logger.info("Committing all changes")
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
        
        logger.info(f"Application submission successful. Message: {message}")
        
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
        logger.error("HTTP Exception occurred during application submission")
        db.rollback()
        raise
    except ValueError as ve:
        logger.error(f"Validation error during application submission: {str(ve)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(ve)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during application submission: {str(e)}")
        logger.exception("Full traceback:")
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