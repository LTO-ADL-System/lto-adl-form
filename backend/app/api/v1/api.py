from fastapi import APIRouter

from app.api.v1.endpoints import auth, auth_supabase, applicants, applications, appointments, documents, admin, public

api_router = APIRouter()

api_router.include_router(public.router, prefix="/public", tags=["public"])
# api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(auth_supabase.router, prefix="/auth-supabase", tags=["supabase-authentication"])
api_router.include_router(applicants.router, prefix="/applicants", tags=["applicants"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])