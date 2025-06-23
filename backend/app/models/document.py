# app/models/document.py
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
from sqlalchemy.sql import func
import uuid

if TYPE_CHECKING:
    from .application import LicenseApplication

class SubmittedDocument(Base):
    __tablename__ = "submitteddocuments"
    
    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(String, ForeignKey("licenseapplication.application_id"), nullable=False)
    document_type = Column(Text, nullable=False)
    file_url = Column(Text, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    is_verified = Column(Boolean, default=False)
    verified_by = Column(String)
    
    # Relationships
    application = relationship("LicenseApplication", back_populates="submitted_documents")
