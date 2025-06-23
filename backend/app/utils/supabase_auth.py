from typing import Optional, Dict, Any
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.applicant import Applicant
from app.models.admin import Admin
import random
import string

class SupabaseAuth:
    def __init__(self):
        self.supabase_url = getattr(settings, 'SUPABASE_URL', None)
        self.supabase_anon_key = getattr(settings, 'SUPABASE_ANON_KEY', None)
        self.supabase_service_key = getattr(settings, 'SUPABASE_SERVICE_KEY', None)
    
    def generate_otp_code(self, length: int = 6) -> str:
        """Generate a random OTP code"""
        return ''.join(random.choices(string.digits, k=length))
    
    async def send_custom_otp_email(self, email: str, otp_code: str, action: str = "signup") -> bool:
        """Send custom OTP email using our email system"""
        try:
            from app.utils.email import send_otp_email
            action_text = "registration" if action == "signup" else "login"
            return send_otp_email(email, otp_code, action_text)
        except Exception as e:
            print(f"Failed to send OTP email: {e}")
            return False
    
    async def store_otp_temporarily(self, email: str, otp_code: str, action: str) -> bool:
        """Store OTP temporarily (in production, use Redis or database)"""
        # For now, we'll use a simple in-memory store
        # In production, you should use Redis or database
        if not hasattr(self, '_otp_store'):
            self._otp_store = {}
        
        key = f"{email}:{action}"
        self._otp_store[key] = {
            'code': otp_code,
            'timestamp': __import__('time').time()
        }
        return True
    
    async def verify_stored_otp(self, email: str, otp_code: str, action: str) -> bool:
        """Verify stored OTP code"""
        if not hasattr(self, '_otp_store'):
            return False
        
        key = f"{email}:{action}"
        stored_otp = self._otp_store.get(key)
        
        if not stored_otp:
            return False
        
        # Check if OTP is expired (5 minutes)
        current_time = __import__('time').time()
        if current_time - stored_otp['timestamp'] > 300:  # 5 minutes
            del self._otp_store[key]
            return False
        
        # Verify code
        if stored_otp['code'] == otp_code:
            del self._otp_store[key]  # Remove after successful verification
            return True
        
        return False
    
    async def sign_up_user(self, email: str, password: str, user_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Sign up a new user with Supabase Auth"""
        if not self.supabase_url or not self.supabase_anon_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/signup"
        headers = {
            "apikey": self.supabase_anon_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "email": email,
            "password": password
        }
        
        if user_metadata:
            data["data"] = user_metadata
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            return response.json()
    
    async def sign_in_user(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in user with Supabase Auth"""
        if not self.supabase_url or not self.supabase_anon_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": self.supabase_anon_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "email": email,
            "password": password
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            result = response.json()
            print(f"DEBUG - Sign in result for {email}: {result}")
            return result
    
    async def verify_token(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Verify Supabase JWT token"""
        if not self.supabase_url or not self.supabase_anon_key:
            return None
        
        url = f"{self.supabase_url}/auth/v1/user"
        headers = {
            "apikey": self.supabase_anon_key,
            "Authorization": f"Bearer {access_token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
    
    async def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
        """Get user information from Supabase by user ID"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/admin/users/{user_id}"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return {"user": response.json()}
            else:
                return {"error": {"message": f"Failed to get user: {response.text}"}}
    
    def get_user_by_uuid(self, db: Session, user_uuid: str, user_type: str = "applicant") -> Optional[Any]:
        """Get user from database by UUID"""
        if user_type == "applicant":
            return db.query(Applicant).filter(Applicant.uuid == user_uuid).first()
        elif user_type == "admin":
            return db.query(Admin).filter(Admin.uuid == user_uuid).first()
        return None
    
    async def send_otp_email_supabase(self, email: str, otp_type: str = "signup") -> Dict[str, Any]:
        """Send OTP email using Supabase Auth"""
        if not self.supabase_url or not self.supabase_anon_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/otp"
        headers = {
            "apikey": self.supabase_anon_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "email": email,
            "type": "email",  # Use "email" type for OTP codes
            "create_user": otp_type == "signup"  # Create user only for signup
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            return response.json()
    
    async def verify_otp_supabase(self, email: str, token: str, otp_type: str = "signup") -> Dict[str, Any]:
        """Verify OTP with Supabase Auth"""
        if not self.supabase_url or not self.supabase_anon_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/verify"
        headers = {
            "apikey": self.supabase_anon_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "type": "email",  # Use "email" type for OTP verification
            "email": email,
            "token": token
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            return response.json()
    
    async def store_otp_with_user_info(self, email: str, otp_code: str, action: str, user_uuid: str, user_type: str) -> bool:
        """Store OTP temporarily with additional user information"""
        # For now, we'll use a simple in-memory store
        # In production, you should use Redis or database
        if not hasattr(self, '_otp_store'):
            self._otp_store = {}
        
        key = f"{email}:{action}"
        self._otp_store[key] = {
            'code': otp_code,
            'timestamp': __import__('time').time(),
            'user_uuid': user_uuid,
            'user_type': user_type
        }
        return True
    
    async def verify_stored_otp_with_info(self, email: str, otp_code: str, action: str) -> dict:
        """Verify stored OTP code and return user info"""
        if not hasattr(self, '_otp_store'):
            return None
        
        key = f"{email}:{action}"
        stored_otp = self._otp_store.get(key)
        
        if not stored_otp:
            return None
        
        # Check if OTP is expired (5 minutes)
        current_time = __import__('time').time()
        if current_time - stored_otp['timestamp'] > 300:  # 5 minutes
            del self._otp_store[key]
            return None
        
        # Verify code
        if stored_otp['code'] == otp_code:
            user_info = {
                'user_uuid': stored_otp['user_uuid'],
                'user_type': stored_otp['user_type']
            }
            del self._otp_store[key]  # Remove after successful verification
            return user_info
        
        return None
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token using refresh token"""
        if not self.supabase_url or not self.supabase_anon_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/token?grant_type=refresh_token"
        headers = {
            "apikey": self.supabase_anon_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "refresh_token": refresh_token
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            return response.json()
    
    async def get_user_status(self, user_uuid: str) -> Dict[str, Any]:
        """Get detailed user status from Supabase Admin API"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/admin/users/{user_uuid}"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            result = response.json()
            print(f"DEBUG - User status for {user_uuid}: {result}")
            return result
    
    async def confirm_email_verification(self, email: str, user_uuid: str) -> Dict[str, Any]:
        """Manually confirm email verification for a user using service key"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/admin/users/{user_uuid}"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "email_confirm": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.put(url, json=data, headers=headers)
            result = response.json()
            print(f"DEBUG - Email confirmation result for {email}: {result}")
            return result
    
    async def create_admin_session(self, user_uuid: str) -> Dict[str, Any]:
        """Create an admin session for a user (updates last_sign_in)"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/admin/generate_link"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "type": "magiclink",
            "user_id": user_uuid
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            result = response.json()
            print(f"DEBUG - Admin session creation result: {result}")
            return result
    
    async def generate_tokens_for_user(self, user_uuid: str) -> Dict[str, Any]:
        """Generate access and refresh tokens for a confirmed user"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/admin/users/{user_uuid}/factors"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        # First, let's try to impersonate the user to generate tokens
        impersonate_url = f"{self.supabase_url}/auth/v1/admin/users/{user_uuid}/impersonate"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(impersonate_url, headers=headers)
            result = response.json()
            print(f"DEBUG - Token generation result for {user_uuid}: {result}")
            return result
    
    async def update_user_last_sign_in(self, user_uuid: str) -> Dict[str, Any]:
        """Update user's last sign-in timestamp using admin API"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/admin/users/{user_uuid}"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        # Update last sign-in timestamp to current time
        import datetime
        current_time = datetime.datetime.utcnow().isoformat() + "Z"
        
        data = {
            "last_sign_in_at": current_time
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.put(url, json=data, headers=headers)
            result = response.json()
            print(f"DEBUG - Last sign-in update result for {user_uuid}: {result}")
            return result

# Global instance
supabase_auth = SupabaseAuth() 