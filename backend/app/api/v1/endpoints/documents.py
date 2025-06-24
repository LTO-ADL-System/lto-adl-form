# app/api/v1/endpoints/documents.py
import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.api.deps import (
    get_db, 
    get_current_applicant, 
    get_document_owner,
    validate_document_upload
)
from app.core.config import settings
from app.crud import crud_document, crud_application
from app.models.applicant import Applicant
from app.models.document import SubmittedDocument
from app.schemas.document import DocumentUpload, DocumentResponse
from app.schemas.response import ResponseModel

router = APIRouter()

@router.post("/upload", response_model=ResponseModel[DocumentResponse])
async def upload_document(
    application_id: str,
    document_type: str,
    file: UploadFile = Depends(validate_document_upload),
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Upload a document for an application"""
    
    # Verify application belongs to current user
    application = crud_application.get_by_id(db, application_id=application_id)
    if not application or application.applicant_id != current_applicant.applicant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this application"
        )
    
    # Check if document type already exists for this application
    existing_doc = crud_document.get_by_type(
        db, 
        application_id=application_id, 
        document_type=document_type
    )
    
    if existing_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document of type '{document_type}' already exists for this application"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create directory if it doesn't exist
    upload_dir = os.path.join(settings.UPLOAD_DIR, "documents")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file"
        )
    
    # Create document record
    file_url = f"/uploads/documents/{unique_filename}"
    
    document_data = DocumentUpload(
        application_id=application_id,
        document_type=document_type
    )
    
    from app.models.document import SubmittedDocument
    document = SubmittedDocument(
        application_id=application_id,
        document_type=document_type,
        file_url=file_url
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return ResponseModel(
        success=True,
        message="Document uploaded successfully",
        data=document
    )

@router.get("/application/{application_id}", response_model=ResponseModel[List[DocumentResponse]])
async def get_application_documents(
    application_id: str,
    db: Session = Depends(get_db),
    current_applicant: Applicant = Depends(get_current_applicant)
):
    """Get all documents for an application"""
    
    # Verify application belongs to current user
    application = crud_application.get_by_id(db, application_id=application_id)
    if not application or application.applicant_id != current_applicant.applicant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this application"
        )
    
    documents = crud_document.get_by_application(db, application_id=application_id)
    
    return ResponseModel(
        success=True,
        message="Documents retrieved successfully",
        data=documents
    )

@router.get("/{document_id}", response_model=ResponseModel[DocumentResponse])
async def get_document(
    document: SubmittedDocument = Depends(get_document_owner)
):
    """Get specific document by ID"""
    
    return ResponseModel(
        success=True,
        message="Document retrieved successfully",
        data=document
    )

@router.delete("/{document_id}", response_model=ResponseModel[dict])
async def delete_document(
    db: Session = Depends(get_db),
    document: SubmittedDocument = Depends(get_document_owner)
):
    """Delete a document"""
    
    # Delete file from filesystem
    if document.file_url:
        file_path = os.path.join(settings.UPLOAD_DIR, document.file_url.lstrip("/uploads/"))
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass  # File might already be deleted
    
    # Delete document record
    crud_document.remove(db, id=document.document_id)
    
    return ResponseModel(
        success=True,
        message="Document deleted successfully",
        data={"document_id": str(document.document_id)}
    )
