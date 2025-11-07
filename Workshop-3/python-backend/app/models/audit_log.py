from sqlalchemy import Column, String, Integer, ForeignKey, Text
from .base import BaseModel

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    entity = Column(String(50))
    details = Column(Text)
