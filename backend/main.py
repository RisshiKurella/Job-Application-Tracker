from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Job Application Tracker API")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# ROOT
# -------------------------

@app.get("/")
def root():
    return {
        "message": "Job Application Tracker API is running!"
    }


# -------------------------
# HEALTH CHECK
# -------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }


# -------------------------
# CREATE APPLICATION
# -------------------------

@app.post("/applications", response_model=schemas.JobApplicationResponse)
def create_application(
    application: schemas.JobApplicationCreate,
    db: Session = Depends(get_db)
):
    new_application = models.JobApplication(
        company_name=application.company_name,
        job_title=application.job_title,
        job_url=application.job_url,
        location=application.location,
        salary=application.salary,
        application_date=application.application_date,
        status=application.status,
        notes=application.notes
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


# -------------------------
# GET ALL APPLICATIONS
# -------------------------

@app.get(
    "/applications",
    response_model=list[schemas.JobApplicationResponse]
)
def get_applications(db: Session = Depends(get_db)):
    applications = (
        db.query(models.JobApplication)
        .order_by(models.JobApplication.id.desc())
        .all()
    )

    return applications


# -------------------------
# GET ONE APPLICATION
# -------------------------

@app.get(
    "/applications/{application_id}",
    response_model=schemas.JobApplicationResponse
)
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(models.JobApplication)
        .filter(models.JobApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Job application not found"
        )

    return application


# -------------------------
# UPDATE APPLICATION
# -------------------------

@app.put(
    "/applications/{application_id}",
    response_model=schemas.JobApplicationResponse
)
def update_application(
    application_id: int,
    updated_application: schemas.JobApplicationCreate,
    db: Session = Depends(get_db)
):
    application = (
        db.query(models.JobApplication)
        .filter(models.JobApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Job application not found"
        )

    application.company_name = updated_application.company_name
    application.job_title = updated_application.job_title
    application.job_url = updated_application.job_url
    application.location = updated_application.location
    application.salary = updated_application.salary
    application.application_date = updated_application.application_date
    application.status = updated_application.status
    application.notes = updated_application.notes

    db.commit()
    db.refresh(application)

    return application


# -------------------------
# DELETE APPLICATION
# -------------------------

@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(models.JobApplication)
        .filter(models.JobApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Job application not found"
        )

    db.delete(application)
    db.commit()

    return {
        "message": "Job application deleted successfully"
    }