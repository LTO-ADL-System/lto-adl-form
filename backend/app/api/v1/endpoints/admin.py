# app/api/v1/endpoints/admin.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import (
    get_db, 
    get_admin_user,
    get_application_for_admin,
    validate_pagination,
    validate_date_range
)
from app.crud import crud_admin, crud_analytics, crud_document, crud_application
from app.models.applicant import Applicant
from app.models.application import LicenseApplication
from app.schemas.admin import (
    DashboardStats,
    AdminApplicationResponse,
    ApplicationApproval,
    ApplicationRejection,
    DocumentVerification
)
from app.schemas.document import DocumentResponse
from app.schemas.response import ResponseModel, PaginatedResponse

router = APIRouter()

@router.get("/dashboard", response_model=ResponseModel[DashboardStats])
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Get admin dashboard statistics"""
    
    stats = crud_analytics.get_dashboard_stats(db)
    
    return ResponseModel(
        success=True,
        message="Dashboard statistics retrieved successfully",
        data=stats
    )

@router.get("/applications", response_model=PaginatedResponse[AdminApplicationResponse])
async def get_all_applications(
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user),
    pagination: tuple = Depends(validate_pagination),
    status_filter: Optional[str] = Query(None, description="Filter by application status"),
    search_query: Optional[str] = Query(None, description="Search by name, ID, or contact")
):
    """Get all applications for admin review"""
    
    skip, limit = pagination
    
    applications = crud_admin.get_all_applications_admin(
        db,
        status_filter=status_filter,
        search_query=search_query,
        skip=skip,
        limit=limit
    )
    
    # Get total count for pagination
    total_applications = crud_admin.get_all_applications_admin(
        db,
        status_filter=status_filter,
        search_query=search_query,
        skip=0,
        limit=1000
    )
    total = len(total_applications)
    
    return PaginatedResponse(
        success=True,
        message="Applications retrieved successfully",
        data=applications,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.get("/applications/{application_id}", response_model=ResponseModel[AdminApplicationResponse])
async def get_application_for_review(
    application: LicenseApplication = Depends(get_application_for_admin)
):
    """Get specific application for admin review"""
    
    return ResponseModel(
        success=True,
        message="Application retrieved successfully",
        data=application
    )

@router.post("/applications/{application_id}/approve", response_model=ResponseModel[AdminApplicationResponse])
async def approve_application(
    approval_data: ApplicationApproval,
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user),
    application: LicenseApplication = Depends(get_application_for_admin)
):
    """Approve an application"""
    
    # Check if application is in approvable status
    if application.application_status_id not in ["ASID_PEN", "ASID_REV"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application cannot be approved in current status"
        )
    
    # Approve application
    approved_application = crud_admin.approve_application(
        db,
        application_id=application.application_id,
        license_number=approval_data.license_number,
        approved_by=admin.applicant_id,
        approval_notes=approval_data.approval_notes
    )
    
    return ResponseModel(
        success=True,
        message="Application approved successfully",
        data=approved_application
    )

@router.post("/applications/{application_id}/reject", response_model=ResponseModel[AdminApplicationResponse])
async def reject_application(
    rejection_data: ApplicationRejection,
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user),
    application: LicenseApplication = Depends(get_application_for_admin)
):
    """Reject an application"""
    
    # Check if application is in rejectable status
    if application.application_status_id not in ["ASID_PEN", "ASID_REV"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application cannot be rejected in current status"
        )
    
    # Reject application
    rejected_application = crud_admin.reject_application(
        db,
        application_id=application.application_id,
        rejection_reason=rejection_data.rejection_reason,
        rejected_by=admin.applicant_id,
        additional_requirements=rejection_data.additional_requirements
    )
    
    return ResponseModel(
        success=True,
        message="Application rejected successfully",
        data=rejected_application
    )

@router.get("/documents/pending-verification", response_model=PaginatedResponse[DocumentResponse])
async def get_pending_verifications(
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user),
    pagination: tuple = Depends(validate_pagination)
):
    """Get documents pending verification"""
    
    skip, limit = pagination
    
    documents = crud_admin.get_pending_verifications(db, skip=skip, limit=limit)
    
    # Get total count
    total_pending = crud_admin.get_pending_verifications(db, skip=0, limit=1000)
    total = len(total_pending)
    
    return PaginatedResponse(
        success=True,
        message="Pending verifications retrieved successfully",
        data=documents,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.post("/documents/{document_id}/verify", response_model=ResponseModel[DocumentResponse])
async def verify_document(
    document_id: str,
    verification_data: DocumentVerification,
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Verify or reject a document"""
    
    document = crud_document.verify_document(
        db,
        document_id=document_id,
        verified_by=admin.applicant_id,
        is_verified=verification_data.is_verified
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    action = "verified" if verification_data.is_verified else "rejected"
    
    return ResponseModel(
        success=True,
        message=f"Document {action} successfully",
        data=document
    )

@router.post("/documents/bulk-verify", response_model=ResponseModel[dict])
async def bulk_verify_documents(
    document_ids: List[str],
    is_verified: bool = True,
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Bulk verify multiple documents"""
    
    count = crud_admin.bulk_verify_documents(
        db,
        document_ids=document_ids,
        verified_by=admin.applicant_id,
        is_verified=is_verified
    )
    
    action = "verified" if is_verified else "rejected"
    
    return ResponseModel(
        success=True,
        message=f"{count} documents {action} successfully",
        data={"verified_count": count}
    )

@router.get("/analytics/trends", response_model=ResponseModel[List[dict]])
async def get_application_trends(
    days: int = Query(30, description="Number of days for trend analysis"),
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Get application trends over time"""
    
    trends = crud_analytics.get_application_trends(db, days=days)
    
    return ResponseModel(
        success=True,
        message="Application trends retrieved successfully",
        data=trends
    )

@router.get("/analytics/demographics", response_model=ResponseModel[List[dict]])
async def get_age_demographics(
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Get age demographics of applicants"""
    
    demographics = crud_analytics.get_age_demographics(db)
    
    return ResponseModel(
        success=True,
        message="Age demographics retrieved successfully",
        data=demographics
    )

@router.get("/analytics/monthly/{year}", response_model=ResponseModel[List[dict]])
async def get_monthly_statistics(
    year: int,
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Get monthly statistics for a year"""
    
    monthly_stats = crud_analytics.get_monthly_statistics(db, year=year)
    
    return ResponseModel(
        success=True,
        message="Monthly statistics retrieved successfully",
        data=monthly_stats
    )

@router.get("/system/health", response_model=ResponseModel[dict])
async def get_system_health(
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Get system health metrics"""
    
    health_metrics = crud_admin.get_system_health(db)
    
    return ResponseModel(
        success=True,
        message="System health metrics retrieved successfully",
        data=health_metrics
    )

@router.post("/generate-license-number", response_model=ResponseModel[dict])
async def generate_license_number(
    db: Session = Depends(get_db),
    admin: Applicant = Depends(get_admin_user)
):
    """Generate a unique license number"""
    
    license_number = crud_admin.generate_license_number(db)
    
    return ResponseModel(
        success=True,
        message="License number generated successfully",
        data={"license_number": license_number}
    )