from typing import Dict, Any, Optional, List
import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import settings


logger = logging.getLogger(__name__)

http_bearer = HTTPBearer(auto_error=True)


def require_auth(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)) -> Dict[str, Any]:
    """
    Validate JWT token and return payload.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        Dict containing JWT claims (sub, email, role, etc.)
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    allowed_algorithms = getattr(settings, "JWT_ALGORITHMS", [settings.JWT_ALGORITHM])
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=allowed_algorithms)
    except JWTError as e:
        logger.debug("JWT decode failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}"
        )

    # Validate required claims
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Validate that required claims exist
    if "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user ID (sub claim)"
        )

    return payload


def get_current_user_id(payload: Dict[str, Any] = Depends(require_auth)) -> int:
    """
    Extract user ID from JWT token payload.
    
    Args:
        payload: JWT token payload from require_auth
        
    Returns:
        User ID as integer
        
    Raises:
        HTTPException: If user ID cannot be extracted
    """
    try:
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user ID"
            )
        return int(user_id_str)
    except (ValueError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid user ID in token: {str(e)}"
        )


def get_current_user_role(payload: Dict[str, Any] = Depends(require_auth)) -> str:
    """
    Extract user role from JWT token payload.
    
    Args:
        payload: JWT token payload from require_auth
        
    Returns:
        User role (ROLE_ADMIN, ROLE_ORGANIZER, ROLE_BUYER)
        
    Raises:
        HTTPException: If role cannot be extracted
    """
    role = payload.get("role")
    if not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user role"
        )
    return role


def get_current_user_email(payload: Dict[str, Any] = Depends(require_auth)) -> str:
    """
    Extract user email from JWT token payload.
    
    Args:
        payload: JWT token payload from require_auth
        
    Returns:
        User email
        
    Raises:
        HTTPException: If email cannot be extracted
    """
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user email"
        )
    return email


def get_current_user_info(payload: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """
    Extract all user information from JWT token payload.
    
    Args:
        payload: JWT token payload from require_auth
        
    Returns:
        Dict with user_id, email, and role
    """
    return {
        "user_id": int(payload.get("sub", 0)),
        "email": payload.get("email", ""),
        "role": payload.get("role", "")
    }


def require_role(allowed_roles: List[str]):
    """
    Dependency to check if user has one of the allowed roles.
    
    Args:
        allowed_roles: List of allowed roles (e.g., ["ROLE_ADMIN", "ROLE_ORGANIZER"])
        
    Returns:
        Dependency function that validates role
    """
    def role_checker(payload: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
        user_role = payload.get("role", "")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}, but user has: {user_role}"
            )
        return payload
    return role_checker


def require_organizer_or_admin(payload: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """
    Dependency to check if user is ORGANIZER or ADMIN.
    
    Args:
        payload: JWT token payload from require_auth
        
    Returns:
        Payload if user is organizer or admin
        
    Raises:
        HTTPException: If user is not organizer or admin
    """
    user_role = payload.get("role", "")
    if user_role not in ["ROLE_ORGANIZER", "ROLE_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires ORGANIZER or ADMIN role"
        )
    return payload


def require_admin(payload: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """
    Dependency to check if user is ADMIN.
    
    Args:
        payload: JWT token payload from require_auth
        
    Returns:
        Payload if user is admin
        
    Raises:
        HTTPException: If user is not admin
    """
    user_role = payload.get("role", "")
    if user_role != "ROLE_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires ADMIN role"
        )
    return payload


def require_buyer_or_admin(payload: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """
    Dependency to check if user is BUYER or ADMIN.
    
    Args:
        payload: JWT token payload from require_auth
        
    Returns:
        Payload if user is buyer or admin
        
    Raises:
        HTTPException: If user is not buyer or admin
    """
    user_role = payload.get("role", "")
    if user_role not in ["ROLE_BUYER", "ROLE_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires BUYER or ADMIN role"
        )
    return payload


def require_buyer(payload: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """
    Dependency to check if user is BUYER.
    """
    user_role = payload.get("role", "")
    if user_role != "ROLE_BUYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires BUYER role"
        )
    return payload


