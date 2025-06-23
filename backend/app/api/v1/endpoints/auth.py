# app/api/v1/endpoints/auth.py
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_applicant
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.crud import crud_applicant, crud_email_otp
from app.models.applicant import Applicant
from app.models.otp import OTPType
from app.schemas.auth import (
    Token, UserLogin, UserRegister, RequestOTP, VerifyOTP, 
    RegisterWithOTP, LoginWithOTP, OTPResponse
)
from app.schemas.applicant import ApplicantCreate, ApplicantResponse
from app.schemas.response import ResponseModel
from app.utils.email import send_otp_email

router = APIRouter()

@router.post("/request-registration-otp", response_model=ResponseModel[OTPResponse])
async def request_registration_otp(
    otp_request: RequestOTP,
    db: Session = Depends(get_db)
):
    """Request OTP for registration"""
    
    # Check if user already exists
    existing_applicant = crud_applicant.get_by_contact(db, contact_num=otp_request.email)
    if existing_applicant and existing_applicant.email == otp_request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Generate and send OTP
    otp = crud_email_otp.create_otp(
        db, 
        email=otp_request.email, 
        otp_type=OTPType.REGISTRATION
    )
    
    # Send OTP email
    email_sent = send_otp_email(otp_request.email, otp.otp_code, "registration")
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )
    
    return ResponseModel(
        success=True,
        message="Verification code sent to your email",
        data=OTPResponse(
            message="Please check your email for the verification code",
            expires_in_minutes=settings.OTP_EXPIRE_MINUTES
        )
    )

@router.post("/verify-registration-otp", response_model=ResponseModel[dict])
async def verify_registration_otp(
    verify_request: VerifyOTP,
    db: Session = Depends(get_db)
):
    """Verify OTP for registration"""
    
    # Verify OTP
    otp = crud_email_otp.verify_otp(
        db,
        email=verify_request.email,
        otp_code=verify_request.otp_code,
        otp_type=OTPType.REGISTRATION
    )
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    return ResponseModel(
        success=True,
        message="Email verified successfully. You can now complete your registration.",
        data={"verified": True}
    )

@router.post("/register", response_model=ResponseModel[ApplicantResponse])
async def register(
    user_data: RegisterWithOTP,
    db: Session = Depends(get_db)
):
    """Complete registration after OTP verification"""
    
    # Verify OTP again (for security)
    otp = crud_email_otp.verify_otp(
        db,
        email=user_data.email,
        otp_code=user_data.otp_code,
        otp_type=OTPType.REGISTRATION
    )
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Check if user already exists
    existing_applicant = crud_applicant.get_by_contact(db, contact_num=user_data.contact_num)
    if existing_applicant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this contact number already exists"
        )
    
    # Hash password
    password_hash = get_password_hash(user_data.password)
    
    # Create applicant data
    applicant_data = ApplicantCreate(
        family_name=user_data.family_name,
        first_name=user_data.first_name,
        middle_name=user_data.middle_name,
        contact_num=user_data.contact_num,
        address=user_data.address,
        nationality=user_data.nationality,
        email=user_data.email,
        password_hash=password_hash,
        # Add default values for required fields
        birthdate="2000-01-01",  # User will update this in profile
        birthplace="Philippines",
        height=170.0,
        weight=70.0,
        eye_color="Brown",
        civil_status="Single",
        educational_attainment="College",
        blood_type="O+",
        sex="Male"
    )
    
    # Create applicant
    applicant = crud_applicant.create(db, obj_in=applicant_data)
    
    return ResponseModel(
        success=True,
        message="Registration completed successfully. Please log in.",
        data=applicant
    )

@router.post("/request-login-otp", response_model=ResponseModel[OTPResponse])
async def request_login_otp(
    otp_request: RequestOTP,
    db: Session = Depends(get_db)
):
    """Request OTP for login"""
    
    # Check if user exists
    applicant = db.query(Applicant).filter(Applicant.email == otp_request.email).first()
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address"
        )
    
    # Generate and send OTP
    otp = crud_email_otp.create_otp(
        db, 
        email=otp_request.email, 
        otp_type=OTPType.LOGIN
    )
    
    # Send OTP email
    email_sent = send_otp_email(otp_request.email, otp.otp_code, "login")
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )
    
    return ResponseModel(
        success=True,
        message="Verification code sent to your email",
        data=OTPResponse(
            message="Please check your email for the verification code",
            expires_in_minutes=settings.OTP_EXPIRE_MINUTES
        )
    )

@router.post("/login", response_model=ResponseModel[Token])
async def login(
    login_data: LoginWithOTP,
    db: Session = Depends(get_db)
):
    """Login with email, password, and OTP verification"""
    
    # Get user by email
    applicant = db.query(Applicant).filter(Applicant.email == login_data.email).first()
    
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not applicant.password_hash or not verify_password(login_data.password, applicant.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify OTP
    otp = crud_email_otp.verify_otp(
        db,
        email=login_data.email,
        otp_code=login_data.otp_code,
        otp_type=OTPType.LOGIN
    )
    
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=applicant.applicant_id,
        expires_delta=access_token_expires
    )
    
    token_data = Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return ResponseModel(
        success=True,
        message="Login successful",
        data=token_data
    )

# Legacy endpoints for backward compatibility
@router.post("/login-legacy", response_model=ResponseModel[Token])
async def login_legacy(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Legacy login endpoint (without OTP) - for development only"""
    
    # For this example, we'll use contact number as username
    applicant = crud_applicant.get_by_contact(db, contact_num=form_data.username)
    
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect contact number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Simple password check for development
    if form_data.password != "password123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect contact number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=applicant.applicant_id,
        expires_delta=access_token_expires
    )
    
    token_data = Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return ResponseModel(
        success=True,
        message="Login successful",
        data=token_data
    )

@router.post("/refresh", response_model=ResponseModel[Token])
async def refresh_token(
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Refresh access token"""
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=current_applicant.applicant_id,
        expires_delta=access_token_expires
    )
    
    token_data = Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return ResponseModel(
        success=True,
        message="Token refreshed successfully",
        data=token_data
    )

@router.get("/me", response_model=ResponseModel[ApplicantResponse])
async def get_current_user(
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Get current authenticated user information"""
    return ResponseModel(
        success=True,
        message="User information retrieved successfully",
        data=current_applicant
    )