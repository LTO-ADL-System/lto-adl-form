# app/api/v1/endpoints/public.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import crud_application_status, crud_application_type, crud_vehicle_category, crud_location, crud_organ
from app.schemas.application import ApplicationStatusResponse, ApplicationTypeResponse
from app.schemas.vehicle import VehicleCategoryResponse
from app.schemas.appointment import LocationResponse
from app.schemas.donation import OrganResponse
from app.schemas.response import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel[dict])
async def root():
    """Welcome endpoint"""
    return ResponseModel(
        success=True,
        message="Welcome to MadaLTO API",
        data={"version": "1.0.0", "status": "operational"}
    )

@router.get("/health", response_model=ResponseModel[dict])
async def health_check():
    """Health check endpoint"""
    return ResponseModel(
        success=True,
        message="Service is healthy",
        data={"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}
    )

@router.get("/application-statuses", response_model=ResponseModel[List[ApplicationStatusResponse]])
async def get_application_statuses(db: Session = Depends(get_db)):
    """Get all available application statuses"""
    statuses = crud_application_status.get_all(db)
    return ResponseModel(
        success=True,
        message="Application statuses retrieved successfully",
        data=statuses
    )

@router.get("/application-types", response_model=ResponseModel[List[ApplicationTypeResponse]])
async def get_application_types(db: Session = Depends(get_db)):
    """Get all available application types"""
    types = crud_application_type.get_all(db)
    return ResponseModel(
        success=True,
        message="Application types retrieved successfully",
        data=types
    )

@router.get("/vehicle-categories", response_model=ResponseModel[List[VehicleCategoryResponse]])
async def get_vehicle_categories(db: Session = Depends(get_db)):
    """Get all available vehicle categories"""
    categories = crud_vehicle_category.get_all(db)
    return ResponseModel(
        success=True,
        message="Vehicle categories retrieved successfully",
        data=categories
    )

@router.get("/locations", response_model=ResponseModel[List[LocationResponse]])
async def get_locations(db: Session = Depends(get_db)):
    """Get all LTO office locations"""
    locations = crud_location.get_all(db)
    return ResponseModel(
        success=True,
        message="Locations retrieved successfully",
        data=locations
    )

@router.get("/organ-types", response_model=ResponseModel[List[OrganResponse]])
async def get_organ_types(db: Session = Depends(get_db)):
    """Get all available organ types for donation"""
    organs = crud_organ.get_all(db)
    return ResponseModel(
        success=True,
        message="Organ types retrieved successfully",
        data=organs
    )
