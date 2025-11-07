from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..schemas.location import LocationCreate, LocationResponse
from ..models.location import Location

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.post("/", response_model=LocationResponse)
async def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@router.get("/", response_model=List[LocationResponse])
async def list_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()


