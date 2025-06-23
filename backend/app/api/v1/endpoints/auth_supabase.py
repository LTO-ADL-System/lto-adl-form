# app/api/v1/endpoints/auth_supabase.py
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_db
from app.core.config import settings
from app.crud import crud_applicant, crud_admin
from app.models.applicant import Applicant
from app.models.admin import Admin
from app.schemas.auth import RequestOTP, OTPResponse, SimpleRegisterWithOTP
from app.schemas.applicant import ApplicantCreate, ApplicantResponse, MinimalApplicantCreate
from app.schemas.admin import AdminCreate, AdminResponse
from app.schemas.response import ResponseModel
from app.utils.supabase_auth import supabase_auth

router = APIRouter()

# Special admin email that gets automatic admin privileges
ADMIN_EMAIL = "madalto.official@gmail.com"

@router.post("/sign-up-request", response_model=ResponseModel[OTPResponse])
async def sign_up_request(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Step 1 of registration: Register via Email and Password
    Creates Supabase user and sends OTP for email confirmation
    """
    
    try:
        # Determine user type based on email
        user_type = "admin" if email == ADMIN_EMAIL else "applicant"
        
        # Create user account with Supabase Auth first
        signup_result = await supabase_auth.sign_up_user(
            email=email,
            password=password,
            user_metadata={"user_type": user_type}
        )
        
        print(f"DEBUG - Signup result: {signup_result}")
        
        if "error" in signup_result:
            error_msg = signup_result["error"]["message"]
            if "already been registered" in error_msg.lower() or "user already registered" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Extract user ID correctly - it's directly in the response
        user_uuid = signup_result.get("id")
        if not user_uuid:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
        
        # Generate custom OTP code for email confirmation
        otp_code = supabase_auth.generate_otp_code()
        
        # Store OTP with user info for later verification
        await supabase_auth.store_otp_with_user_info(email, otp_code, "signup", user_uuid, user_type)
        
        # Send OTP email using our custom email system
        email_sent = await supabase_auth.send_custom_otp_email(email, otp_code, "signup")
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email"
            )
        
        return ResponseModel(
            success=True,
            message="Account created! Verification code sent to your email. Please verify to complete registration.",
            data=OTPResponse(
                message="Please enter the 6-digit code sent to your email to complete registration",
                expires_in_minutes=5
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create account: {str(e)}"
        )

@router.post("/login-request", response_model=ResponseModel[OTPResponse])
async def login_request(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Step 1 of login: Request login with email and password
    Validates credentials and sends OTP for additional security
    """
    
    try:
        # Verify credentials with Supabase first
        signin_result = await supabase_auth.sign_in_user(email=email, password=password)
        
        if "error" in signin_result:
            error_msg = signin_result["error"]["message"]
            if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Generate and send OTP for additional security
        otp_code = supabase_auth.generate_otp_code()
        await supabase_auth.store_otp_temporarily(email, otp_code, "login")
        
        # Send OTP email
        email_sent = await supabase_auth.send_custom_otp_email(email, otp_code, "login")
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email"
            )
        
        return ResponseModel(
            success=True,
            message="Verification code sent to your email. Please check your inbox.",
            data=OTPResponse(
                message="Please enter the 6-digit code sent to your email",
                expires_in_minutes=5
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification code: {str(e)}"
        )

@router.post("/verify-otp", response_model=ResponseModel[dict])
async def verify_otp(
    email: str,
    password: str,
    otp_code: str,
    action: str,  # "signup" or "login"
    db: Session = Depends(get_db)
):
    """
    Step 2: Verify OTP for both signup and login
    Only handles authentication - no profile creation
    Applicant profiles are created only during application form submission
    """
    
    try:
        if action not in ["signup", "login"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action must be either 'signup' or 'login'"
            )
        
        if action == "signup":
            return await handle_signup_verification(email, password, otp_code, db)
        else:  # login
            return await handle_login_verification(email, password, otp_code, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )

async def handle_signup_verification(email: str, password: str, otp_code: str, db: Session):
    """Handle signup verification - only confirms email, no profile creation"""
    
    try:
        # Verify OTP and get stored user info
        user_info = await supabase_auth.verify_stored_otp_with_info(email, otp_code, "signup")
        
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code"
            )
        
        user_uuid = user_info['user_uuid']
        user_type = user_info['user_type']
        
        print(f"DEBUG - Confirming email verification for user {user_uuid}")
        
        # Confirm email verification with Supabase (this is crucial!)
        confirm_result = await supabase_auth.confirm_email_verification(email, user_uuid)
        
        if "error" in confirm_result:
            print(f"DEBUG - Email confirmation failed: {confirm_result}")
            # Continue anyway, as the user might already be confirmed
        
        # Check user status after confirmation
        user_status = await supabase_auth.get_user_by_id(user_uuid)
        print(f"DEBUG - User status after confirmation: {user_status}")
        
        # Generate tokens directly instead of signing in (which might fail for unconfirmed users)
        token_result = await supabase_auth.generate_tokens_for_user(user_uuid)
        
        if "error" in token_result:
            print(f"DEBUG - Token generation failed, trying regular sign-in: {token_result}")
            # Fallback to regular sign-in
            signin_result = await supabase_auth.sign_in_user(email=email, password=password)
            
            if "error" in signin_result:
                print(f"DEBUG - Sign in failed after email confirmation: {signin_result}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to authenticate user after email confirmation"
                )
        else:
            # Use the generated tokens
            signin_result = token_result
        
        # Manually update last sign-in timestamp to ensure it's recorded
        print(f"DEBUG - Updating last sign-in timestamp for user {user_uuid}")
        await supabase_auth.update_user_last_sign_in(user_uuid)
        
        # For admin users, create admin profile in database
        if user_type == "admin":
            # Check if admin profile already exists
            admin = crud_admin.get_admin_by_uuid(db, uuid=UUID(user_uuid))
            if not admin:
                # Auto-create admin profile for the special admin email
                admin_data = AdminCreate(
                    email=ADMIN_EMAIL,
                    full_name="MadaLTO System Administrator",
                    role="super_admin",
                    can_manage_users=True
                )
                admin = crud_admin.create_admin(db, obj_in=admin_data, uuid=UUID(user_uuid))
            
            return ResponseModel(
                success=True,
                message="Admin registration completed! Welcome to MadaLTO Admin Portal.",
                data={
                    "user_id": user_uuid,
                    "user_type": "admin",
                    "email": email,
                    "access_token": signin_result.get("access_token"),
                    "refresh_token": signin_result.get("refresh_token"),
                    "expires_in": signin_result.get("expires_in", 3600),
                    "has_admin_profile": True,
                    "admin_profile": admin
                }
            )
        else:
            # For regular users, just return auth info - no applicant profile creation
            return ResponseModel(
                success=True,
                message="Registration completed! You can now access the system. Complete your application when ready.",
                data={
                    "user_id": user_uuid,
                    "user_type": "applicant",
                    "email": email,
                    "access_token": signin_result.get("access_token"),
                    "refresh_token": signin_result.get("refresh_token"),
                    "expires_in": signin_result.get("expires_in", 3600),
                    "has_applicant_profile": False,
                    "message": "Profile will be created when you submit your first application"
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG - Exception in handle_signup_verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

async def handle_login_verification(email: str, password: str, otp_code: str, db: Session):
    """Handle login verification - returns authentication tokens and checks for existing profiles"""
    
    try:
        # Verify OTP
        otp_valid = await supabase_auth.verify_stored_otp(email, otp_code, "login")
        
        if not otp_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code"
            )
        
        print(f"DEBUG - OTP verified for login: {email}")
        
        # Sign in with Supabase to get fresh tokens
        signin_result = await supabase_auth.sign_in_user(email=email, password=password)
        
        if "error" in signin_result:
            print(f"DEBUG - Login sign-in failed: {signin_result}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        print(f"DEBUG - Login sign-in successful for {email}")
        
        # Extract user ID correctly from signin response
        user_uuid = signin_result.get("user", {}).get("id") or signin_result.get("id")
        
        # Manually update last sign-in timestamp to ensure it's recorded
        print(f"DEBUG - Updating last sign-in timestamp for user {user_uuid}")
        await supabase_auth.update_user_last_sign_in(user_uuid)
        
        # Check user type from Supabase metadata
        user_metadata = signin_result.get("user", {}).get("user_metadata", {})
        user_type = user_metadata.get("user_type", "applicant")
        
        # Special handling for admin email
        if email == ADMIN_EMAIL or user_type == "admin":
            # Check if admin profile exists
            admin = crud_admin.get_admin_by_uuid(db, uuid=UUID(user_uuid))
            if not admin:
                # Auto-create admin profile if it doesn't exist
                admin_data = AdminCreate(
                    email=ADMIN_EMAIL,
                    full_name="MadaLTO System Administrator",
                    role="super_admin",
                    can_manage_users=True
                )
                admin = crud_admin.create_admin(db, obj_in=admin_data, uuid=UUID(user_uuid))
            
            return ResponseModel(
                success=True,
                message="Admin login successful! Welcome back.",
                data={
                    "user_id": user_uuid,
                    "user_type": "admin",
                    "email": email,
                    "access_token": signin_result.get("access_token"),
                    "refresh_token": signin_result.get("refresh_token"),
                    "expires_in": signin_result.get("expires_in", 3600),
                    "has_admin_profile": True,
                    "admin_profile": admin
                }
            )
        else:
            # For regular users, check if they have an applicant profile
            applicant = crud_applicant.get_by_email(db, email=email)
            
            return ResponseModel(
                success=True,
                message="Login successful! Welcome back.",
                data={
                    "user_id": user_uuid,
                    "user_type": "applicant",
                    "email": email,
                    "access_token": signin_result.get("access_token"),
                    "refresh_token": signin_result.get("refresh_token"),
                    "expires_in": signin_result.get("expires_in", 3600),
                    "has_applicant_profile": applicant is not None,
                    "applicant_profile": applicant if applicant else None,
                    "message": "Complete your application to create your profile" if not applicant else "Profile found"
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG - Exception in handle_login_verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/refresh-token", response_model=ResponseModel[dict])
async def refresh_token(
    refresh_token: str
):
    """Refresh access token using refresh token"""
    
    try:
        result = await supabase_auth.refresh_access_token(refresh_token)
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        return ResponseModel(
            success=True,
            message="Token refreshed successfully",
            data={
                "access_token": result.get("access_token"),
                "refresh_token": result.get("refresh_token"),
                "expires_in": result.get("expires_in", 3600)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )

@router.get("/user-profile", response_model=ResponseModel[dict])
async def get_user_profile(
    email: str,
    db: Session = Depends(get_db)
):
    """Get user profile information - checks both auth and applicant data"""
    
    try:
        # Check if user has an applicant profile
        applicant = crud_applicant.get_by_email(db, email=email)
        
        # Check if user is admin
        if email == ADMIN_EMAIL:
            # Get admin profile by email (you might need to add this method)
            admin = db.query(Admin).filter(Admin.email == email).first()
            
            return ResponseModel(
                success=True,
                message="User profile retrieved",
                data={
                    "user_type": "admin",
                    "email": email,
                    "has_admin_profile": admin is not None,
                    "has_applicant_profile": False,
                    "admin_profile": admin
                }
            )
        else:
            return ResponseModel(
                success=True,
                message="User profile retrieved",
                data={
                    "user_type": "applicant",
                    "email": email,
                    "has_admin_profile": False,
                    "has_applicant_profile": applicant is not None,
                    "applicant_profile": applicant
                }
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        ) 