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
    ApplicationRejection,
    DocumentVerification
)
from app.schemas.document import DocumentResponse
from app.schemas.response import ResponseModel, PaginatedResponse

router = APIRouter()

@router.get("/dashboard", response_model=ResponseModel[DashboardStats])
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
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
    admin: dict = Depends(get_admin_user),
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

@router.get("/applications/filtered", response_model=PaginatedResponse[AdminApplicationResponse])
async def get_filtered_applications(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
    pagination: tuple = Depends(validate_pagination),
    type_filter: Optional[str] = Query(None, description="Filter by application type: New, Renewal, Duplicate"),
    status_filter: Optional[str] = Query(None, description="Filter by status: Verifying, Resubmission, Rejected, Approved"),
    sort_by: str = Query("date_desc", description="Sort by: date_asc (ascending) or date_desc (descending)"),
    search_query: Optional[str] = Query(None, description="Search by name, ID, or contact")
):
    """
    Get applications with advanced filtering and sorting options
    
    Filter By Type:
    - New: New license applications
    - Renewal: License renewal applications  
    - Duplicate: Duplicate license applications
    
    Filter By Status:
    - Verifying: Applications under verification (Pending/Subject for Approval)
    - Resubmission: Applications requiring resubmission
    - Rejected: Rejected applications
    - Approved: Approved applications
    
    Sort By:
    - date_asc: Date in ascending order (oldest first)
    - date_desc: Date in descending order (newest first)
    """
    
    skip, limit = pagination
    
    # Validate sort_by parameter
    if sort_by not in ["date_asc", "date_desc"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sort_by parameter. Must be 'date_asc' or 'date_desc'"
        )
    
    # Validate type_filter parameter
    if type_filter and type_filter.lower() not in ["new", "renewal", "duplicate"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid type_filter. Must be 'New', 'Renewal', or 'Duplicate'"
        )
    
    # Validate status_filter parameter
    if status_filter and status_filter.lower() not in ["verifying", "resubmission", "rejected", "approved"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status_filter. Must be 'Verifying', 'Resubmission', 'Rejected', or 'Approved'"
        )
    
    result = crud_admin.get_filtered_applications(
        db,
        type_filter=type_filter,
        status_filter=status_filter,
        sort_by=sort_by,
        search_query=search_query,
        skip=skip,
        limit=limit
    )
    
    return PaginatedResponse(
        success=True,
        message="Filtered applications retrieved successfully",
        data=result["applications"],
        total=result["total"],
        page=result["page"],
        size=result["size"],
        pages=result["pages"]
    )

@router.get("/applications/filter-options", response_model=ResponseModel[dict])
async def get_application_filter_options(
    admin: dict = Depends(get_admin_user)
):
    """Get available filter options for application filtering"""
    
    filter_options = {
        "types": [
            {"value": "new", "label": "New"},
            {"value": "renewal", "label": "Renewal"},
            {"value": "duplicate", "label": "Duplicate"}
        ],
        "statuses": [
            {"value": "verifying", "label": "Verifying", "description": "Applications under verification"},
            {"value": "resubmission", "label": "For Resubmission", "description": "Applications requiring resubmission"},
            {"value": "rejected", "label": "Rejected", "description": "Rejected applications"},
            {"value": "approved", "label": "Approved", "description": "Approved applications"}
        ],
        "sort_options": [
            {"value": "date_desc", "label": "Date (Newest First)"},
            {"value": "date_asc", "label": "Date (Oldest First)"}
        ]
    }
    
    return ResponseModel(
        success=True,
        message="Filter options retrieved successfully",
        data=filter_options
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
    application_id: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
):
    """Approve an application - simplified process requiring only application_id"""
    
    # Get application to check if it exists and is in valid status
    application = await get_application_for_admin(application_id, db, admin)
    
    # Check if application is in approvable status
    if application.application_status_id not in ["ASID_PEN", "ASID_REV", "ASID_SFA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Application cannot be approved. Current status: {application.application_status_id}"
        )
    
    # Approve application
    approved_application = crud_admin.approve_application(
        db,
        application_id=application_id,
        approved_by=admin["uuid"]
    )
    
    if not approved_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return ResponseModel(
        success=True,
        message="Application approved successfully",
        data=approved_application
    )

@router.post("/applications/bulk-approve", response_model=ResponseModel[dict])
async def bulk_approve_applications(
    application_ids: List[str],
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
):
    """Bulk approve multiple applications"""
    
    if not application_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No application IDs provided"
        )
    
    if len(application_ids) > 50:  # Limit to prevent abuse
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot approve more than 50 applications at once"
        )
    
    # Bulk approve applications
    result = crud_admin.bulk_approve_applications(
        db,
        application_ids=application_ids,
        approved_by=admin["uuid"]
    )
    
    return ResponseModel(
        success=True,
        message=f"Bulk approval completed. {result['successful_count']} successful, {result['failed_count']} failed.",
        data=result
    )

@router.post("/applications/{application_id}/reject", response_model=ResponseModel[AdminApplicationResponse])
async def reject_application(
    rejection_data: ApplicationRejection,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
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
        rejected_by=admin["uuid"],  # Use admin UUID instead of applicant_id
        additional_requirements=rejection_data.additional_requirements
    )
    
    return ResponseModel(
        success=True,
        message="Application rejected successfully",
        data=rejected_application
    )

@router.post("/applications/bulk-reject", response_model=ResponseModel[dict])
async def bulk_reject_applications(
    request_data: ApplicationRejection,
    application_ids: List[str],
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
):
    """Bulk reject multiple applications"""
    
    if not application_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No application IDs provided"
        )
    
    if len(application_ids) > 50:  # Limit to prevent abuse
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reject more than 50 applications at once"
        )
    
    # Bulk reject applications
    result = crud_admin.bulk_reject_applications(
        db,
        application_ids=application_ids,
        rejection_reason=request_data.rejection_reason,
        rejected_by=admin["uuid"],
        additional_requirements=request_data.additional_requirements
    )
    
    return ResponseModel(
        success=True,
        message=f"Bulk rejection completed. {result['successful_count']} successful, {result['failed_count']} failed.",
        data=result
    )

@router.post("/applications/bulk-actions", response_model=ResponseModel[dict])
async def bulk_application_actions(
    action: str,
    application_ids: List[str],
    rejection_reason: Optional[str] = None,
    additional_requirements: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
):
    """
    Perform bulk actions on multiple applications
    
    Available actions:
    - 'approve': Approve applications (uses ASID_APR status)
    - 'reject': Reject applications (requires rejection_reason)
    """
    
    if not application_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No application IDs provided"
        )
    
    if len(application_ids) > 50:  # Limit to prevent abuse
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot process more than 50 applications at once"
        )
    
    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'approve' or 'reject'"
        )
    
    if action == "reject" and not rejection_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is required for reject action"
        )
    
    # Perform bulk action
    if action == "approve":
        result = crud_admin.bulk_approve_applications(
            db,
            application_ids=application_ids,
            approved_by=admin["uuid"]
        )
        message = f"Bulk approval completed. {result['successful_count']} successful, {result['failed_count']} failed."
    else:  # reject
        result = crud_admin.bulk_reject_applications(
            db,
            application_ids=application_ids,
            rejection_reason=rejection_reason,
            rejected_by=admin["uuid"],
            additional_requirements=additional_requirements
        )
        message = f"Bulk rejection completed. {result['successful_count']} successful, {result['failed_count']} failed."
    
    return ResponseModel(
        success=True,
        message=message,
        data=result
    )

@router.get("/documents/pending-verification", response_model=PaginatedResponse[DocumentResponse])
async def get_pending_verifications(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
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
    admin: dict = Depends(get_admin_user)
):
    """Verify or reject a document"""
    
    document = crud_document.verify_document(
        db,
        document_id=document_id,
        verified_by=admin["uuid"],  # Use admin UUID instead of applicant_id
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
    admin: dict = Depends(get_admin_user)
):
    """Bulk verify multiple documents"""
    
    count = crud_admin.bulk_verify_documents(
        db,
        document_ids=document_ids,
        verified_by=admin["uuid"],  # Use admin UUID instead of applicant_id
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
    admin: dict = Depends(get_admin_user)
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
    admin: dict = Depends(get_admin_user)
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
    admin: dict = Depends(get_admin_user)
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
    admin: dict = Depends(get_admin_user)
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
    admin: dict = Depends(get_admin_user)
):
    """Generate a unique license number"""
    
    license_number = crud_admin.generate_license_number(db)
    
    return ResponseModel(
        success=True,
        message="License number generated successfully",
        data={"license_number": license_number}
    )