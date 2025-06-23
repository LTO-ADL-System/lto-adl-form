from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re


class SimpleUserRegister(BaseModel):
    """Simplified registration - only email and password required"""
    email: EmailStr
    password: str
    confirm_password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v


class UserRegister(BaseModel):
    """Legacy registration schema - kept for backward compatibility"""
    email: EmailStr
    password: str
    confirm_password: str
    
    # Personal Information
    family_name: str
    first_name: str
    middle_name: Optional[str] = None
    contact_num: str
    address: str
    nationality: str = "Filipino"
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('contact_num')
    def validate_phone(cls, v):
        if not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    user_id: Optional[str] = None


class UserCreate(BaseModel):
    family_name: str
    first_name: str
    middle_name: Optional[str] = None
    contact_num: str
    nationality: str = "Filipino"
    sex: str
    birthdate: str  # You might want to use date type
    birthplace: str
    height: float
    weight: float
    civil_status: str
    educational_attainment: str
    blood_type: str
    is_organ_donor: bool = False
    eye_color: str
    password: str
    
    @validator('contact_num')
    def validate_phone(cls, v):
        if not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v


class UserResponse(BaseModel):
    applicant_id: str
    family_name: str
    first_name: str
    middle_name: Optional[str] = None
    contact_num: str
    email: Optional[str] = None
    is_active: bool = True
    
    class Config:
        orm_mode = True


# Additional schemas for auth endpoints

class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class ChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


# OTP Verification Schemas

class RequestOTP(BaseModel):
    email: EmailStr


class VerifyOTP(BaseModel):
    email: EmailStr
    otp_code: str
    
    @validator('otp_code')
    def validate_otp_code(cls, v):
        if not v.isdigit():
            raise ValueError('OTP code must contain only digits')
        if len(v) != 6:
            raise ValueError('OTP code must be 6 digits')
        return v


class SimpleRegisterWithOTP(BaseModel):
    """Simplified registration with OTP - only email and password required"""
    email: EmailStr
    password: str
    confirm_password: str
    otp_code: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('otp_code')
    def validate_otp_code(cls, v):
        if not v.isdigit():
            raise ValueError('OTP code must contain only digits')
        if len(v) != 6:
            raise ValueError('OTP code must be 6 digits')
        return v


class RegisterWithOTP(BaseModel):
    """Legacy registration with OTP - kept for backward compatibility"""
    email: EmailStr
    password: str
    confirm_password: str
    otp_code: str
    
    # Personal Information
    family_name: str
    first_name: str
    middle_name: Optional[str] = None
    contact_num: str
    address: str
    nationality: str = "Filipino"
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('contact_num')
    def validate_phone(cls, v):
        if not re.match(r'^\+63\d{10}$', v):
            raise ValueError('Phone number must be in format +63XXXXXXXXXX')
        return v
    
    @validator('otp_code')
    def validate_otp_code(cls, v):
        if not v.isdigit():
            raise ValueError('OTP code must contain only digits')
        if len(v) != 6:
            raise ValueError('OTP code must be 6 digits')
        return v


class LoginWithOTP(BaseModel):
    email: EmailStr
    password: str
    otp_code: str
    
    @validator('otp_code')
    def validate_otp_code(cls, v):
        if not v.isdigit():
            raise ValueError('OTP code must contain only digits')
        if len(v) != 6:
            raise ValueError('OTP code must be 6 digits')
        return v


class OTPResponse(BaseModel):
    message: str
    expires_in_minutes: int