from sqlalchemy import Column, String, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class OTPType(enum.Enum):
    REGISTRATION = "registration"
    LOGIN = "login"
    PASSWORD_RESET = "password_reset"

class EmailOTP(Base):
    __tablename__ = "email_otps"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    otp_type = Column(Enum(OTPType), nullable=False)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    used_at = Column(DateTime(timezone=True), nullable=True)
    
    def __init__(self, **kwargs):
        if 'id' not in kwargs:
            import uuid
            kwargs['id'] = f"OTP_{uuid.uuid4().hex[:8].upper()}"
        super().__init__(**kwargs) 