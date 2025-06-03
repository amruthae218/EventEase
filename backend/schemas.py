from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, validator
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Event schemas
class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    date_time: datetime
    auditorium: str
    price: float
    max_accommodation: int
    club_name: str  


class EventCreate(EventBase):
    pass
    
class Event(EventBase):
    id: int
    created_at: datetime
    organizer_id: int

    class Config:
        from_attributes = True
        
class EventWithCount(Event):
    total_participants: int

# Registration schemas
class RegistrationBase(BaseModel):
    event_id: int

class RegistrationCreate(RegistrationBase):
    pass

class Registration(RegistrationBase):
    id: int
    participant_id: int
    registration_date: datetime

    class Config:
        from_attributes = True
