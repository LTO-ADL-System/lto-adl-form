# app/crud/otp.py
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
import random
import string
from app.crud.base import CRUDBase
from app.models.otp import EmailOTP, OTPType
from app.core.config import settings

class CRUDEmailOTP(CRUDBase[EmailOTP, None, None]):
    def generate_otp_code(self) -> str:
        """Generate a random OTP code"""
        return ''.join(random.choices(string.digits, k=settings.OTP_LENGTH))
    
    def create_otp(
        self, 
        db: Session, 
        *, 
        email: str, 
        otp_type: OTPType
    ) -> EmailOTP:
        """Create a new OTP for email verification"""
        # Invalidate any existing OTPs for this email and type
        self.invalidate_existing_otps(db, email=email, otp_type=otp_type)
        
        # Generate new OTP
        otp_code = self.generate_otp_code()
        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        
        otp = EmailOTP(
            email=email,
            otp_code=otp_code,
            otp_type=otp_type,
            expires_at=expires_at
        )
        
        db.add(otp)
        db.commit()
        db.refresh(otp)
        return otp
    
    def verify_otp(
        self, 
        db: Session, 
        *, 
        email: str, 
        otp_code: str, 
        otp_type: OTPType
    ) -> Optional[EmailOTP]:
        """Verify OTP code"""
        otp = db.query(EmailOTP).filter(
            and_(
                EmailOTP.email == email,
                EmailOTP.otp_code == otp_code,
                EmailOTP.otp_type == otp_type,
                EmailOTP.is_used == False,
                EmailOTP.expires_at > datetime.utcnow()
            )
        ).first()
        
        if otp:
            # Mark as used
            otp.is_used = True
            otp.used_at = datetime.utcnow()
            db.commit()
            db.refresh(otp)
        
        return otp
    
    def invalidate_existing_otps(
        self, 
        db: Session, 
        *, 
        email: str, 
        otp_type: OTPType
    ) -> int:
        """Invalidate all existing OTPs for an email and type"""
        count = db.query(EmailOTP).filter(
            and_(
                EmailOTP.email == email,
                EmailOTP.otp_type == otp_type,
                EmailOTP.is_used == False
            )
        ).update({"is_used": True, "used_at": datetime.utcnow()})
        
        db.commit()
        return count
    
    def cleanup_expired_otps(self, db: Session) -> int:
        """Clean up expired OTPs"""
        count = db.query(EmailOTP).filter(
            EmailOTP.expires_at < datetime.utcnow()
        ).delete()
        
        db.commit()
        return count
    
    def get_by_email_and_type(
        self, 
        db: Session, 
        *, 
        email: str, 
        otp_type: OTPType
    ) -> Optional[EmailOTP]:
        """Get the latest OTP for email and type"""
        return db.query(EmailOTP).filter(
            and_(
                EmailOTP.email == email,
                EmailOTP.otp_type == otp_type,
                EmailOTP.is_used == False,
                EmailOTP.expires_at > datetime.utcnow()
            )
        ).order_by(EmailOTP.created_at.desc()).first()

crud_email_otp = CRUDEmailOTP(EmailOTP) 