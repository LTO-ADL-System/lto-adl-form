# app/models/base.py
from sqlalchemy import Column, DateTime, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class TimestampMixin:
    """Mixin for adding timestamp fields"""
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    last_updated_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
