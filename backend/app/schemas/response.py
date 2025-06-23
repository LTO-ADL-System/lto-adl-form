# app/schemas/response.py
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List

T = TypeVar('T')

class ResponseModel(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: Optional[T] = None

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: List[T]
    total: int
    page: int
    size: int
    pages: int

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None
    error_code: Optional[str] = None 