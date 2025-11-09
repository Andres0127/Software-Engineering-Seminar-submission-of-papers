from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import events, tickets, orders, locations, categories
from app.models import Base
from app.core.database import engine

# Create database tables
Base.metadata.create_all(bind=engine)

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

# Include routers
app.include_router(events.router)
app.include_router(tickets.router)
app.include_router(orders.router)
app.include_router(locations.router)
app.include_router(categories.router)

@app.get("/")
async def root():
    return {"message": "Event Platform Business Logic API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "python-backend"}
