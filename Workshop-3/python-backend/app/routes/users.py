from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserType, UserStatus
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.utils.auth import require_auth, require_admin


router = APIRouter(prefix="/api/users", tags=["users"], dependencies=[Depends(require_auth)], redirect_slashes=False)


@router.post("/", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")
    user = User(
        name=payload.name,
        email=payload.email,
        phone_number=payload.phone_number,
        user_type=UserType(payload.user_type),
        status=UserStatus(payload.status) if payload.status else UserStatus.ACTIVE,
        organization_name=payload.organization_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    payload: dict = Depends(require_admin)
):
    """List all users - Admin only"""
    import logging
    logger = logging.getLogger(__name__)
    
    users = db.query(User).order_by(User.id.asc()).offset(skip).limit(limit).all()
    logger.info(f"Found {len(users)} users in database")
    
    # Ensure all users have a valid status
    for user in users:
        if user.status is None:
            user.status = UserStatus.ACTIVE
    
    # Log user details for debugging
    for user in users:
        logger.info(f"User: {user.id} - {user.name} - {user.email} - {user.user_type} - {user.status}")
    
    return users


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.name is not None:
        user.name = payload.name
    if payload.phone_number is not None:
        user.phone_number = payload.phone_number
    if payload.user_type is not None:
        user.user_type = UserType(payload.user_type)
    if payload.status is not None:
        user.status = UserStatus(payload.status)
    if payload.organization_name is not None:
        user.organization_name = payload.organization_name
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return None


