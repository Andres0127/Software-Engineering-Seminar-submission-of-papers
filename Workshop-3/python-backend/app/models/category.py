from sqlalchemy import Column, String
from .base import BaseModel

class Category(BaseModel):
    __tablename__ = "categories"
    
    name = Column(String(50), nullable=False, unique=True)
    description = Column(String(200))
