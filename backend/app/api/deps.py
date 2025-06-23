# app/api/deps.py
import os
import logging
import asyncio
from pathlib import Path
from typing import Generator, Optional, Union
from datetime import datetime, timedelta
from contextlib import contextmanager
from collections import defaultdict

from fastapi import Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.crud import crud_appointment, crud_application, crud_document

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import verify_token
from app.crud import crud_applicant, crud_admin
from app.models.applicant import Applicant
from app.schemas.auth import TokenData

from contextlib import contextmanager

import logging

# Security scheme
security = HTTPBearer()

def get_db() -> Generator:
    """
    Database dependency.
    Creates a new database session for each request.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and validate JWT token from Authorization header.
    Returns the token payload if valid.
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token_data = TokenData(user_id=user_id)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_data.user_id

def get_current_applicant(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_token)
) -> Applicant:
    """
    Get current authenticated applicant.
    This dependency ensures the user is authenticated and returns their applicant record.
    """
    # In a real implementation, you might have a separate Users table
    # For this example, we'll use the applicant_id as the user identifier
    applicant = crud_applicant.get_by_id(db, applicant_id=user_id)
    
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Applicant not found"
        )
    
    return applicant

def get_current_active_applicant(
    current_applicant: Applicant = Depends(get_current_applicant)
) -> Applicant:
    """
    Get current active applicant.
    Add any additional checks for account status here.
    """
    # Add any business logic for account status
    # For example, check if account is suspended, verified, etc.
    
    return current_applicant

def get_admin_user(
    current_applicant: Applicant = Depends(get_current_applicant)
) -> Applicant:
    """
    Dependency for admin-only endpoints.
    Validates that the current user has admin privileges.
    """
    # In a real implementation, you'd check admin role from a roles table
    # For this example, we'll use a simple check or environment variable
    
    # Option 1: Check if user is in admin list (from environment)
    admin_users = getattr(settings, 'ADMIN_USERS', '').split(',')
    if current_applicant.applicant_id not in admin_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    
    return current_applicant

def get_optional_current_applicant(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[Applicant]:
    """
    Optional authentication dependency.
    Returns applicant if authenticated, None if not.
    Used for endpoints that work for both authenticated and anonymous users.
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id:
            return crud_applicant.get_by_id(db, applicant_id=user_id)
    except (JWTError, ValidationError):
        pass
    
    return None

# File Upload Dependencies

async def validate_file_upload(
    file: UploadFile = File(...)
) -> UploadFile:
    """
    Validate uploaded file for size and type constraints.
    """
    # Check file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Check file type
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
        )
    
    # Validate filename
    if not file.filename or len(file.filename) > 255:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    # Check for potentially dangerous file extensions
    dangerous_extensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js']
    file_extension = Path(file.filename).suffix.lower()
    if file_extension in dangerous_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed for security reasons"
        )
    
    return file

async def validate_image_upload(
    file: UploadFile = Depends(validate_file_upload)
) -> UploadFile:
    """
    Additional validation for image files.
    """
    image_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in image_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only image files are allowed. Supported formats: {', '.join(image_types)}"
        )
    
    return file

async def validate_document_upload(
    file: UploadFile = Depends(validate_file_upload)
) -> UploadFile:
    """
    Additional validation for document files.
    """
    document_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in document_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only PDF and image files are allowed for documents. Supported formats: {', '.join(document_types)}"
        )
    
    return file

# Application Access Dependencies

def get_application_owner(
    application_id: str,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """
    Verify that the current user owns the specified application.
    """
    
    application = crud_application.get_by_id(db, application_id=application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.applicant_id != current_applicant.applicant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this application"
        )
    
    return application

def get_application_for_admin(
    application_id: str,
    db: Session = Depends(get_db),
    admin_user: Applicant = Depends(get_admin_user)
):
    """
    Get application for admin access (no ownership verification).
    """
    
    application = crud_application.get_by_id(db, application_id=application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return application

def get_document_owner(
    document_id: str,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """
    Verify that the current user owns the specified document.
    """
    
    document = crud_document.get_by_id(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if the document belongs to user's application
    application = crud_application.get_by_id(db, application_id=document.application_id)
    if not application or application.applicant_id != current_applicant.applicant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this document"
        )
    
    return document

def get_appointment_owner(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """
    Verify that the current user owns the specified appointment.
    """
    
    appointment = crud_appointment.get_by_id(db, appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check if the appointment belongs to user's application
    application = crud_application.get_by_id(db, application_id=appointment.application_id)
    if not application or application.applicant_id != current_applicant.applicant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this appointment"
        )
    
    return appointment

# Validation Dependencies

def validate_pagination(
    skip: int = 0,
    limit: int = 100
) -> tuple[int, int]:
    """
    Validate pagination parameters.
    """
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip parameter must be non-negative"
        )
    
    if limit <= 0 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit parameter must be between 1 and 1000"
        )
    
    return skip, limit

def validate_date_range(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Validate and parse date range parameters.
    """
    parsed_start = None
    parsed_end = None
    
    if start_date:
        try:
            parsed_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use YYYY-MM-DD"
            )
    
    if end_date:
        try:
            parsed_end = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use YYYY-MM-DD"
            )
    
    if parsed_start and parsed_end and parsed_start > parsed_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before or equal to end date"
        )
    
    return parsed_start, parsed_end

# Rate Limiting Dependencies (Optional - for future implementation)

# Simple in-memory rate limiter (for production, use Redis)
request_counts = defaultdict(list)

async def rate_limit(
    request_limit: int = 100,  # requests per window
    window_minutes: int = 15,  # time window in minutes
    current_applicant: Optional[Applicant] = Depends(get_optional_current_applicant)
):
    """
    Simple rate limiting based on user or IP.
    In production, use Redis-based rate limiting.
    """
    # Use applicant_id if authenticated, otherwise use a generic key
    user_key = current_applicant.applicant_id if current_applicant else "anonymous"
    
    now = datetime.now()
    window_start = now - timedelta(minutes=window_minutes)
    
    # Clean old requests
    request_counts[user_key] = [
        req_time for req_time in request_counts[user_key] 
        if req_time > window_start
    ]
    
    # Check rate limit
    if len(request_counts[user_key]) >= request_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {request_limit} requests per {window_minutes} minutes."
        )
    
    # Record this request
    request_counts[user_key].append(now)

# Environment and Feature Flags

def get_feature_flags() -> dict:
    """
    Get feature flags for conditional functionality.
    """
    return {
        "enable_organ_donation": getattr(settings, 'ENABLE_ORGAN_DONATION', True),
        "enable_online_payment": getattr(settings, 'ENABLE_ONLINE_PAYMENT', False),
        "enable_sms_notifications": getattr(settings, 'ENABLE_SMS_NOTIFICATIONS', False),
        "enable_email_notifications": getattr(settings, 'ENABLE_EMAIL_NOTIFICATIONS', True),
        "maintenance_mode": getattr(settings, 'MAINTENANCE_MODE', False)
    }

def check_maintenance_mode():
    """
    Check if system is in maintenance mode.
    """
    if getattr(settings, 'MAINTENANCE_MODE', False):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="System is currently under maintenance. Please try again later."
        )

# Custom Exception Handler Dependencies

class BusinessLogicError(Exception):
    """Custom exception for business logic errors"""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

def handle_business_logic_error(error: BusinessLogicError):
    """Convert business logic errors to HTTP exceptions"""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "message": error.message,
            "error_code": error.error_code
        }
    )

# Application State Dependencies

def validate_application_status_transition(
    current_status: str,
    new_status: str
) -> bool:
    """
    Validate if status transition is allowed.
    """
    # Define allowed status transitions
    allowed_transitions = {
        "ASID_PEN": ["ASID_REV", "ASID_APP", "ASID_REJ"],  # Pending -> Under Review, Approved, Rejected
        "ASID_REV": ["ASID_APP", "ASID_REJ", "ASID_PEN"],  # Under Review -> Approved, Rejected, Pending
        "ASID_APP": [],  # Approved -> No transitions allowed
        "ASID_REJ": ["ASID_PEN"],  # Rejected -> Can resubmit to Pending
        "ASID_COM": []  # Completed -> No transitions allowed
    }
    
    if new_status not in allowed_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status transition from {current_status} to {new_status} is not allowed"
        )
    
    return True

# Database Transaction Dependencies
@contextmanager
def get_db_transaction():
    """
    Database transaction context manager.
    Automatically commits on success, rolls back on error.
    """
    db = SessionLocal()
    try:
        db.begin()
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()



def get_request_logger(
    current_applicant: Optional[Applicant] = Depends(get_optional_current_applicant)
) -> logging.Logger:
    """
    Get logger with user context.
    """
    logger = logging.getLogger("madalto.api")
    
    if current_applicant:
        logger = logging.LoggerAdapter(logger, {
            "user_id": current_applicant.applicant_id,
            "user_name": f"{current_applicant.first_name} {current_applicant.family_name}"
        })
    
    return logger