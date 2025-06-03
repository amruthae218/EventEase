from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # "participant", "club_rep", "faculty"
    is_active = Column(Boolean, default=True)
    
    # Relationships
    created_events = relationship("Event", back_populates="organizer")
    registrations = relationship("Registration", back_populates="participant")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    club_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date_time = Column(DateTime)
    auditorium = Column(String)  # "Netaji", "MGR", "VOC"
    price = Column(Float)
    max_accommodation = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    organizer = relationship("User", back_populates="created_events")
    registrations = relationship("Registration", back_populates="event")

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    participant_id = Column(Integer, ForeignKey("users.id"))
    registration_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    participant = relationship("User", back_populates="registrations") 