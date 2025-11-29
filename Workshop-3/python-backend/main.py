from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.routes import events, tickets, orders, locations, categories, payments, notifications
from app.models import Base
from app.core.database import engine
import logging

logger = logging.getLogger(__name__)

# Database tables are created by the SQL script (00-setup-complete-database.sql)
# Do not use Base.metadata.create_all() as it cannot create PostgreSQL ENUMs
# Run the setup script first: scripts/setup-database.ps1 or setup-database.sh
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Business Logic Service for Event Platform"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.url.path}: {exc.errors()}")
    try:
        body = await request.body()
        logger.error(f"Request body: {body.decode()}")
    except Exception as e:
        logger.error(f"Could not read request body: {e}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "message": "Validation error. Check the 'detail' field for specific field errors."
        },
    )

# Include routers
app.include_router(events.router)
app.include_router(tickets.router)
app.include_router(orders.router)
app.include_router(locations.router)
app.include_router(categories.router)
app.include_router(payments.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {"message": "Event Platform Business Logic API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "python-backend"}

@app.get("/api/health")
async def api_health_check():
    return {"status": "healthy", "service": "python-backend"}
