# app/crud/document.py
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.crud.base import CRUDBase
from app.models.document import SubmittedDocument
from app.schemas.document import DocumentUpload

class CRUDDocument(CRUDBase[SubmittedDocument, DocumentUpload, None]):
    def get_by_id(self, db: Session, *, document_id: str) -> Optional[SubmittedDocument]:
        return db.query(SubmittedDocument).options(
            joinedload(SubmittedDocument.application)
        ).filter(SubmittedDocument.document_id == document_id).first()
    
    def get_by_application(self, db: Session, *, application_id: str) -> List[SubmittedDocument]:
        return db.query(SubmittedDocument).filter(
            SubmittedDocument.application_id == application_id
        ).order_by(SubmittedDocument.uploaded_at).all()
    
    def get_by_type(self, db: Session, *, application_id: str, document_type: str) -> Optional[SubmittedDocument]:
        return db.query(SubmittedDocument).filter(
            and_(
                SubmittedDocument.application_id == application_id,
                SubmittedDocument.document_type == document_type
            )
        ).first()
    
    def get_unverified_documents(self, db: Session, skip: int = 0, limit: int = 100) -> List[SubmittedDocument]:
        return db.query(SubmittedDocument).options(
            joinedload(SubmittedDocument.application)
        ).filter(
            SubmittedDocument.is_verified == False
        ).order_by(SubmittedDocument.uploaded_at).offset(skip).limit(limit).all()
    
    def verify_document(
        self, 
        db: Session, 
        *, 
        document_id: str, 
        verified_by: str,
        is_verified: bool = True
    ) -> Optional[SubmittedDocument]:
        """Verify or reject a document"""
        document = self.get_by_id(db, document_id=document_id)
        if not document:
            return None
        
        document.is_verified = is_verified
        document.verified_by = verified_by
        
        db.commit()
        db.refresh(document)
        return document
    
    def get_required_documents_status(self, db: Session, *, application_id: str) -> dict:
        """Get status of all required documents for an application"""
        required_docs = [
            "Birth Certificate", "Residence Certificate", "Medical Certificate",
            "Drug Test Result", "Driving Course Certificate", "Valid ID", "Passport Photo"
        ]
        
        submitted_docs = self.get_by_application(db, application_id=application_id)
        doc_status = {}
        
        for doc_type in required_docs:
            doc = next((d for d in submitted_docs if d.document_type == doc_type), None)
            doc_status[doc_type] = {
                "submitted": doc is not None,
                "verified": doc.is_verified if doc else False,
                "document_id": str(doc.document_id) if doc else None
            }
        
        return doc_status

crud_document = CRUDDocument(SubmittedDocument)
