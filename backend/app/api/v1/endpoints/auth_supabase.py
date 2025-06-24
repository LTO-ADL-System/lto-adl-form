# app/api/v1/endpoints/auth_supabase.py
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_db
from app.core.config import settings
from app.crud import crud_applicant
from app.models.applicant import Applicant
from app.schemas.auth import RequestOTP, OTPResponse, SimpleRegisterWithOTP
from app.schemas.applicant import ApplicantCreate, ApplicantResponse, MinimalApplicantCreate
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
    Step 1 of registration: Store credentials and send OTP
    Does NOT create Supabase user yet - only sends OTP for verification
    """
    
    try:
        # Check if user already exists in Supabase by trying to sign in
        existing_check = await supabase_auth.sign_in_user(email=email, password="dummy")
        if "access_token" in existing_check or ("error" in existing_check and "invalid" not in existing_check["error"]["message"].lower()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Determine user type based on email
        user_type = "admin" if email == ADMIN_EMAIL else "applicant"
        
        # Generate OTP code
        otp_code = supabase_auth.generate_otp_code(4)
        
        # Store user credentials temporarily until OTP verification
        await supabase_auth.store_pending_user(email, password, user_type, otp_code)
        
        # Send OTP email using our custom email system
        email_sent = await supabase_auth.send_custom_otp_email(email, otp_code, "signup")
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email"
            )
        
        return ResponseModel(
            success=True,
            message="Verification code sent to your email. Please verify to complete registration.",
            data=OTPResponse(
                message="Please enter the 4-digit code sent to your email to complete registration",
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

@router.post("/login-request", response_model=ResponseModel[OTPResponse])
async def login_request(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """
    Step 1 of login: Verify credentials and send OTP
    Validates credentials with Supabase and sends OTP for additional security
    """
    
    try:
        # Verify credentials with Supabase first
        signin_result = await supabase_auth.sign_in_user(email=email, password=password)
        
        if "error" in signin_result or "error_code" in signin_result:
            error_msg = signin_result.get("msg") or signin_result.get("error", {}).get("message", "Unknown error")
            error_code = signin_result.get("error_code")
            
            # Handle specific error cases
            if error_code == "email_provider_disabled":
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Email authentication is currently disabled. Please enable email provider in Supabase settings."
                )
            elif "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Authentication failed: {error_msg}"
                )
        
        # Generate and send OTP for additional security
        otp_code = supabase_auth.generate_otp_code(4)
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
                message="Please enter the 4-digit code sent to your email",
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
    otp_code: str,
    action: str,  # "signup" or "login"
    password: str = None,  # Only needed for login
    db: Session = Depends(get_db)
):
    """
    Step 2: Verify OTP for both signup and login
    For signup: Creates Supabase user AFTER OTP verification
    For login: Authenticates existing user AFTER OTP verification
    """
    
    try:
        if action not in ["signup", "login"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action must be either 'signup' or 'login'"
            )
        
        if action == "signup":
            return await handle_signup_verification(email, otp_code, db)
        else:  # login
            if not password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password is required for login verification"
                )
            return await handle_login_verification(email, password, otp_code, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )

async def handle_signup_verification(email: str, otp_code: str, db: Session):
    """Handle signup verification - creates Supabase user AFTER OTP verification"""
    
    try:
        # Verify OTP and get pending user data
        pending_user = await supabase_auth.verify_otp_and_get_pending_user(email, otp_code)
        
        if not pending_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code"
            )
        
        user_type = pending_user['user_type']
        password = pending_user['password']
        
        print(f"DEBUG - Creating confirmed user for {email}")
        
        # NOW create the Supabase user with email already confirmed
        signup_result = await supabase_auth.create_confirmed_user(
            email=email,
            password=password,
            user_metadata={"user_type": user_type}
        )
        
        if "error" in signup_result:
            error_msg = signup_result["error"]["message"]
            if "already been registered" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Extract user ID from the result
        user_uuid = signup_result.get("id")
        if not user_uuid:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
        
        print(f"DEBUG - User created successfully: {user_uuid}")
        
        # Now sign in the user to get tokens
        signin_result = await supabase_auth.sign_in_user(email=email, password=password)
        
        if "error" in signin_result:
            print(f"DEBUG - Sign-in failed after user creation: {signin_result}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User created but failed to sign in. Please try logging in."
            )
        
        # Simple email-based admin check (no database dependency)
        if email == ADMIN_EMAIL:
            # Admin user
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
                    "is_admin": True,
                    "admin_permissions": {
                        "can_approve_applications": True,
                        "can_manage_users": True,
                        "can_view_analytics": True,
                        "can_manage_appointments": True
                    }
                }
            )
        else:
            # Regular applicant user
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
                    "is_admin": False,
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
    """Handle login verification - authenticates user AFTER OTP verification"""
    
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
        
        if "error" in signin_result or "error_code" in signin_result:
            error_msg = signin_result.get("msg") or signin_result.get("error", {}).get("message", "Unknown error")
            error_code = signin_result.get("error_code")
            
            print(f"DEBUG - Login sign-in failed: {signin_result}")
            
            # Handle specific error cases
            if error_code == "email_provider_disabled":
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Email authentication is currently disabled. Please contact support or enable email provider in Supabase settings."
                )
            elif "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Authentication failed: {error_msg}"
                )
        
        print(f"DEBUG - Login sign-in successful for {email}")
        
        # Extract user ID from signin response
        user_uuid = signin_result.get("user", {}).get("id") or signin_result.get("id")
        
        if not user_uuid:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user information"
            )
        
        # Update last sign-in timestamp
        await supabase_auth.update_user_last_sign_in(user_uuid)
        
        # Simple email-based admin check (no database dependency)
        if email == ADMIN_EMAIL:
            # Admin user
            return ResponseModel(
                success=True,
                message="Admin login successful! Welcome back to MadaLTO Admin Portal.",
                data={
                    "user_id": user_uuid,
                    "user_type": "admin",
                    "email": email,
                    "access_token": signin_result.get("access_token"),
                    "refresh_token": signin_result.get("refresh_token"),
                    "expires_in": signin_result.get("expires_in", 3600),
                    "is_admin": True,
                    "admin_permissions": {
                        "can_approve_applications": True,
                        "can_manage_users": True,
                        "can_view_analytics": True,
                        "can_manage_appointments": True
                    }
                }
            )
        else:
            # Regular applicant user
            # Check if applicant profile exists (users become applicants only after submitting applications)
            try:
                applicant = crud_applicant.get_applicant_by_uuid(db, uuid=UUID(user_uuid))
                has_applicant_profile = applicant is not None
            except Exception:
                # Normal case - user hasn't submitted application yet, so no applicant profile exists
                applicant = None
                has_applicant_profile = False
            
            return ResponseModel(
                success=True,
                message="Login successful! Welcome back to MadaLTO.",
                data={
                    "user_id": user_uuid,
                    "user_type": "applicant",
                    "email": email,
                    "access_token": signin_result.get("access_token"),
                    "refresh_token": signin_result.get("refresh_token"),
                    "expires_in": signin_result.get("expires_in", 3600),
                    "is_admin": False,
                    "has_applicant_profile": has_applicant_profile,
                    "applicant_profile": applicant if has_applicant_profile else None
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
        # Simple email-based admin check
        if email == ADMIN_EMAIL:
            return ResponseModel(
                success=True,
                message="Admin profile retrieved successfully",
                data={
                    "user_type": "admin",
                    "email": email,
                    "is_admin": True,
                    "admin_permissions": {
                        "can_approve_applications": True,
                        "can_manage_users": True,
                        "can_view_analytics": True,
                        "can_manage_appointments": True
                    }
                }
            )
        else:
            # Check if user has an applicant profile
            try:
                applicant = crud_applicant.get_by_email(db, email=email)
                has_applicant_profile = applicant is not None
            except Exception as e:
                print(f"DEBUG - Could not check applicant profile: {e}")
                applicant = None
                has_applicant_profile = False
            
            return ResponseModel(
                success=True,
                message="User profile retrieved successfully",
                data={
                    "user_type": "applicant",
                    "email": email,
                    "is_admin": False,
                    "has_applicant_profile": has_applicant_profile,
                    "applicant_profile": applicant if has_applicant_profile else None
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )

@router.get("/verify-token", response_model=ResponseModel[dict])
async def verify_access_token(
    token: str
):
    """Verify if access token is valid and return user info"""
    
    try:
        user_info = await supabase_auth.verify_token(token)
        
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        email = user_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token data"
            )
        
        # Simple email-based admin check
        is_admin = email == ADMIN_EMAIL
        user_type = "admin" if is_admin else "applicant"
        
        return ResponseModel(
            success=True,
            message="Token is valid",
            data={
                "user_id": user_info.get("id"),
                "email": email,
                "user_type": user_type,
                "is_admin": is_admin,
                "token_valid": True
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token verification failed: {str(e)}"
        )