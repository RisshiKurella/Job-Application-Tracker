from sqlalchemy import Column, Integer, String, Text, Date
from database import Base


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String(200), nullable=False)
    job_title = Column(String(200), nullable=False)
    job_url = Column(String(500), nullable=True)
    location = Column(String(200), nullable=True)

    salary = Column(String(100), nullable=True)

    application_date = Column(Date, nullable=True)

    status = Column(
        String(50),
        default="Applied",
        nullable=False
    )

    notes = Column(Text, nullable=True)