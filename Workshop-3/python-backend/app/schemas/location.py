from pydantic import BaseModel, ConfigDict

class LocationBase(BaseModel):
    name: str
    address: str
    capacity: int

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int


