# app/api/v1/endpoints/applications.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import (
    get_db, 
    get_current_applicant, 
    get_application_owner,
    validate_pagination,

)
from app.crud import crud_application, crud_vehicle_category
from app.models.applicant import Applicant
from app.models.application import LicenseApplication
from app.schemas.application import (
    LicenseApplicationCreate, 
    LicenseApplicationResponse,
    ApplicationStatusHistoryResponse
)
from app.schemas.response import ResponseModel, PaginatedResponse

router = APIRouter()

@router.post("/", response_model=ResponseModel[LicenseApplicationResponse])
async def submit_application(
    application_data: LicenseApplicationCreate,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Submit a new license application"""
    
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
    
    return ResponseModel(
        success=True,
        message="Application submitted successfully",
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