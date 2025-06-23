from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import text
from .base import Base

class ArchivedApplication(Base):
    __tablename__ = "archivedapplications"
    
    # Auto-generated archive ID as primary key
    archive_id = Column(
        String, 
        primary_key=True,
        server_default=text("'ARCH_' || lpad(nextval('archive_seq')::text, 3, '0')")
    )
    
    application_id = Column(String, nullable=False)
    applicant_id = Column(String)
    application_type_id = Column(String)
    application_status_id = Column(String)
    submission_date = Column(DateTime(timezone=True))
    last_updated_date = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    additional_requirements = Column(String) 