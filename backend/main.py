from datetime import timedelta,datetime
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth, database
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from .schemas import EventWithCount




# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Event Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8001"],  # only allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication endpoints
@app.post("/token", tags=['Authentication'])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    # ✅ Add user info to the response
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


@app.post("/users/", response_model=schemas.User,tags=['Users'])
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        is_active=True  # Optional: you can default this to True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/me/", response_model=schemas.User,tags=['Users'])
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.post("/events/", response_model=schemas.Event,tags=['Events'])
async def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)):
    
    print(f"DEBUG: current_user.role = {current_user.role}")
    # Role check 
    if current_user.role.lower() not in ["club_rep", "faculty"]:
        raise HTTPException(status_code=403, detail="Only organizers or faculty can create events.")

    new_event = models.Event(
        name=event.name,
        club_name=event.club_name,
        description=event.description,
        date_time=event.date_time,
        auditorium=event.auditorium,
        price=event.price,
        max_accommodation=event.max_accommodation,
        organizer_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


@app.get("/events/{event_id}", response_model=schemas.Event,tags=['Events'])
def get_event(event_id: int, db: Session = Depends(database.get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event



# Registration endpoints
@app.post("/events/{event_id}/register/", response_model=schemas.Registration,tags=['Events'])
def register_for_event(
    event_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != "participant":
        raise HTTPException(status_code=403, detail="Only participants can register for events")
    
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already registered
    existing_registration = db.query(models.Registration).filter(
        models.Registration.event_id == event_id,
        models.Registration.participant_id == current_user.id
    ).first()
    if existing_registration:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Check if event is full
    current_registrations = db.query(models.Registration).filter(
        models.Registration.event_id == event_id
    ).count()
    if current_registrations >= event.max_accommodation:
        raise HTTPException(status_code=400, detail="Event is full")
    
    registration = models.Registration(
        event_id=event_id,
        participant_id=current_user.id
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration 

from datetime import datetime

@app.get("/events/", response_model=List[schemas.Event], tags=['Events'])
def list_events(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    current_time = datetime.utcnow()
    future_events = db.query(models.Event).filter(models.Event.date_time >= current_time).all()
    return future_events


@app.get("/registrations/mine", response_model=List[schemas.Registration],tags=['Registrations'])
def get_my_registrations(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    if current_user.role != "participant":
        raise HTTPException(status_code=403, detail="Only participants can view their registrations")
    return db.query(models.Registration).filter(models.Registration.participant_id == current_user.id).all()

@app.get("/events/organized/upcoming", response_model=List[schemas.EventWithCount],tags=['Events'])
def get_upcoming_events_for_organizer(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    events = (
        db.query(models.Event, func.count(models.Registration.id).label("total_participants"))
        .outerjoin(models.Registration, models.Event.id == models.Registration.event_id)
        .filter(models.Event.organizer_id == current_user.id, models.Event.date_time >= datetime.utcnow())
        .group_by(models.Event.id)
        .all()
    )

    return [
        schemas.EventWithCount(
            id=e.id,
            name=e.name,
            description=e.description,
            date_time=e.date_time,
            auditorium=e.auditorium,
            price=e.price,
            max_accommodation=e.max_accommodation,
            club_name=e.club_name,
            created_at=e.created_at,
            organizer_id=e.organizer_id,
            total_participants=total
        )
        for e, total in events
    ]




@app.get("/events/organized/past", response_model=List[schemas.EventWithCount],tags=['Events'])
def get_past_events_for_organizer(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    events = (
        db.query(models.Event, func.count(models.Registration.id).label("total_participants"))
        .outerjoin(models.Registration, models.Event.id == models.Registration.event_id)
        .filter(models.Event.organizer_id == current_user.id, models.Event.date_time < datetime.utcnow())
        .group_by(models.Event.id)
        .all()
    )

    return [
        schemas.EventWithCount(
            id=e.id,
            name=e.name,
            description=e.description,
            date_time=e.date_time,
            auditorium=e.auditorium,
            price=e.price,
            max_accommodation=e.max_accommodation,
            club_name=e.club_name,
            created_at=e.created_at,
            organizer_id=e.organizer_id,
            total_participants=total
        )
        for e, total in events
    ]

