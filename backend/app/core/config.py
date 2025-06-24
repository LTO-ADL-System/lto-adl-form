# app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/madalto_db"
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "password"
    DATABASE_NAME: str = "madalto_db"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MadaLTO"
    PROJECT_VERSION: str = "1.0.0"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_FILE_TYPES: list = ["image/jpeg", "image/png", "application/pdf"]
    ALLOWED_FILE_EXTENSIONS: str = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
    
    # CORS - Allow all origins for development (change for production)
    BACKEND_CORS_ORIGINS: list = ["*"]
    FRONTEND_URL: str = "*"
    
    # Email Configuration
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: str = "MadaLTO System"
    
    # OTP Configuration
    OTP_EXPIRE_MINUTES: int = 5
    OTP_LENGTH: int = 4
    
    # Supabase Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    
    model_config = {"env_file": ".env"}
    
    def get_database_url(self) -> str:
        """Get database URL, constructing from components if DATABASE_URL is not valid"""
        # If DATABASE_URL is set and looks valid, use it
        if self.DATABASE_URL and self.DATABASE_URL.startswith(("postgresql://", "postgres://")):
            return self.DATABASE_URL
        
        # Otherwise, construct from individual components
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"

settings = Settings()