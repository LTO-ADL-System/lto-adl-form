# app/main.py
import logging
import json
from fastapi import Request
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.v1.api import api_router

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log request details for debugging
    if request.url.path.endswith("/submit-complete"):
        logger = logging.getLogger("request_logger")
        logger.info(f"=== REQUEST TO {request.url.path} ===")
        logger.info(f"Method: {request.method}")
        logger.info(f"Headers: {dict(request.headers)}")
        
        # Read and log request body
        body = await request.body()
        if body:
            try:
                body_str = body.decode('utf-8')
                logger.info(f"Raw body: {body_str}")
                # Try to parse as JSON for better formatting
                try:
                    body_json = json.loads(body_str)
                    logger.info(f"Parsed JSON: {json.dumps(body_json, indent=2)}")
                except:
                    pass
            except Exception as e:
                logger.error(f"Could not decode body: {e}")
        
        # Create a new request with the body
        from fastapi import Request
        from starlette.datastructures import Headers
        
        async def receive():
            return {
                "type": "http.request",
                "body": body,
                "more_body": False
            }
        
        new_request = Request(request.scope, receive)
        response = await call_next(new_request)
        
        logger.info(f"Response status: {response.status_code}")
        return response
    else:
        response = await call_next(request)
        return response

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.PROJECT_VERSION}