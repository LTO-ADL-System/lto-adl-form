# app/schemas/base.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BaseSchema(BaseModel):
    class Config:
        orm_mode = True
        use_enum_values = True

class TimestampMixin(BaseModel):
    created_date: Optional[datetime] = None
    last_updated_date: Optional[datetime] = None 