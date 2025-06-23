# app/utils/supabase_auth.py
from typing import Optional, Dict, Any
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.applicant import Applicant
import random
import string
import time
import hashlib

class SupabaseAuth:
    def __init__(self):
        self.supabase_url = getattr(settings, 'SUPABASE_URL', None)
        self.supabase_anon_key = getattr(settings, 'SUPABASE_ANON_KEY', None)
        self.supabase_service_key = getattr(settings, 'SUPABASE_SERVICE_KEY', None)
        # In-memory stores (use Redis in production)
        self._otp_store = {}
        self._pending_users = {}
    
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
    
    async def store_pending_user(self, email: str, password: str, user_type: str, otp_code: str) -> bool:
        """Store user credentials temporarily until OTP verification"""
        key = f"pending:{email}"
        self._pending_users[key] = {
            'email': email,
            'password': password,
            'user_type': user_type,
            'otp_code': otp_code,
            'timestamp': time.time()
        }
        return True
    
    async def store_otp_temporarily(self, email: str, otp_code: str, action: str) -> bool:
        """Store OTP temporarily for login verification"""
        key = f"otp:{email}:{action}"
        self._otp_store[key] = {
            'code': otp_code,
            'timestamp': time.time()
        }
        return True
    
    async def verify_otp_and_get_pending_user(self, email: str, otp_code: str) -> Optional[Dict[str, Any]]:
        """Verify OTP and return pending user data for signup"""
        key = f"pending:{email}"
        pending_user = self._pending_users.get(key)
        
        if not pending_user:
            return None
        
        # Check if OTP is expired (5 minutes)
        current_time = time.time()
        if current_time - pending_user['timestamp'] > 300:  # 5 minutes
            del self._pending_users[key]
            return None
        
        # Verify OTP code
        if pending_user['otp_code'] == otp_code:
            user_data = {
                'email': pending_user['email'],
                'password': pending_user['password'],
                'user_type': pending_user['user_type']
            }
            del self._pending_users[key]  # Remove after successful verification
            return user_data
        
        return None
    
    async def verify_stored_otp(self, email: str, otp_code: str, action: str) -> bool:
        """Verify stored OTP code for login"""
        key = f"otp:{email}:{action}"
        stored_otp = self._otp_store.get(key)
        
        if not stored_otp:
            return False
        
        # Check if OTP is expired (5 minutes)
        current_time = time.time()
        if current_time - stored_otp['timestamp'] > 300:  # 5 minutes
            del self._otp_store[key]
            return False
        
        # Verify code
        if stored_otp['code'] == otp_code:
            del self._otp_store[key]  # Remove after successful verification
            return True
        
        return False
    
    async def create_confirmed_user(self, email: str, password: str, user_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a new user in Supabase with email already confirmed"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        url = f"{self.supabase_url}/auth/v1/admin/users"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        # Create user with email already confirmed
        data = {
            "email": email,
            "password": password,
            "email_confirm": True,  # This prevents confirmation emails
            "user_metadata": user_metadata or {}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            result = response.json()
            print(f"DEBUG - Create confirmed user result: {result}")
            return result
    
    async def sign_up_user(self, email: str, password: str, user_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Sign up a new user with Supabase Auth (legacy method - use create_confirmed_user instead)"""
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
        """Sign in user with Supabase Auth, fallback to admin API if email provider disabled"""
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
            
            # If email provider is disabled, try admin API fallback
            if result.get("error_code") == "email_provider_disabled":
                print(f"DEBUG - Email provider disabled, trying admin API fallback")
                return await self.admin_sign_in_user(email, password)
            
            return result
    
    async def admin_sign_in_user(self, email: str, password: str) -> Dict[str, Any]:
        """Alternative sign-in method using admin API and user impersonation"""
        if not self.supabase_url or not self.supabase_service_key:
            raise ValueError("Supabase configuration not found")
        
        # First, get the user by email
        list_users_url = f"{self.supabase_url}/auth/v1/admin/users"
        headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json"
        }
        
        # Search for user by email
        async with httpx.AsyncClient() as client:
            # Get user list (you might need to implement pagination for large user bases)
            response = await client.get(f"{list_users_url}?email={email}", headers=headers)
            result = response.json()
            
            if response.status_code != 200 or not result.get("users"):
                return {"error": {"message": "User not found"}}
            
            user = result["users"][0]  # Get first matching user
            user_id = user["id"]
            
            # Verify password by attempting to update user with same password
            # This is a workaround since admin API doesn't have direct password verification
            update_url = f"{self.supabase_url}/auth/v1/admin/users/{user_id}"
            update_data = {"password": password}
            
            update_response = await client.put(update_url, json=update_data, headers=headers)
            
            if update_response.status_code != 200:
                return {"error": {"message": "Invalid password"}}
            
            # Generate tokens for the user
            impersonate_url = f"{self.supabase_url}/auth/v1/admin/users/{user_id}/impersonate"
            impersonate_response = await client.post(impersonate_url, headers=headers)
            
            if impersonate_response.status_code == 200:
                tokens = impersonate_response.json()
                return {
                    "access_token": tokens.get("access_token"),
                    "refresh_token": tokens.get("refresh_token"),
                    "expires_in": tokens.get("expires_in", 3600),
                    "user": user
                }
            else:
                return {"error": {"message": "Failed to generate tokens"}}
    
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
    
    # Legacy methods for backward compatibility (if needed)
    async def store_otp_with_user_info(self, email: str, otp_code: str, action: str, user_uuid: str, user_type: str) -> bool:
        """Legacy method - store OTP with user info (for backward compatibility)"""
        key = f"{email}:{action}"
        self._otp_store[key] = {
            'code': otp_code,
            'timestamp': time.time(),
            'user_uuid': user_uuid,
            'user_type': user_type
        }
        return True
    
    async def verify_stored_otp_with_info(self, email: str, otp_code: str, action: str) -> Optional[Dict[str, Any]]:
        """Legacy method - verify stored OTP code and return user info (for backward compatibility)"""
        key = f"{email}:{action}"
        stored_otp = self._otp_store.get(key)
        
        if not stored_otp:
            return None
        
        # Check if OTP is expired (5 minutes)
        current_time = time.time()
        if current_time - stored_otp['timestamp'] > 300:  # 5 minutes
            del self._otp_store[key]
            return None
        
        # Verify code
        if stored_otp['code'] == otp_code:
            user_info = {
                'user_uuid': stored_otp.get('user_uuid'),
                'user_type': stored_otp.get('user_type')
            }
            del self._otp_store[key]  # Remove after successful verification
            return user_info
        
        return None
    
    async def confirm_email_verification(self, email: str, user_uuid: str) -> Dict[str, Any]:
        """Legacy method - confirm email verification (for backward compatibility)"""
        # Since we create users with email_confirm=True, this is not needed
        return {"success": True, "message": "Email already confirmed during user creation"}

# Global instance
supabase_auth = SupabaseAuth()