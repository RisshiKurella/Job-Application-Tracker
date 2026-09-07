from pydantic import BaseModel
from typing import Optional
from datetime import date


class JobApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    application_date: Optional[date] = None
    status: str = "Applied"
    notes: Optional[str] = None


class JobApplicationResponse(JobApplicationCreate):
    id: int

    class Config:
        from_attributes = True