# 💼 Job Application Tracker

A full-stack web application for tracking, managing, and analyzing job applications from a single dashboard.

The application allows users to add job applications, update their status, search and filter applications, view detailed information, and analyze their job-search progress through statistics and conversion analytics.

---

## 🚀 Features

### 📋 Application Management
- Add new job applications
- Edit existing applications
- Delete applications
- View complete application details
- Store company, job title, URL, location, salary, application date, status, and notes

### 🔎 Search & Filtering
- Search applications by company or job title
- Filter applications by status
- Sort applications by:
  - Newest first
  - Oldest first
  - Company A–Z
  - Company Z–A
  - Status

### 📊 Dashboard Analytics
- Total applications
- Interview applications
- Offers received
- Rejected applications
- Application status overview
- Success funnel
- Conversion analytics

### 🎯 Application Status Tracking

Applications can have the following statuses:

- Applied
- Interview
- Offer
- Rejected
- Withdrawn

### 💻 Responsive Interface
- Clean dashboard interface
- Responsive layout
- Application details modal
- Easy-to-use forms and controls

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database
- PostgreSQL

### Development Tools
- VS Code
- Git
- GitHub
- REST API

---

## 🏗️ Project Structure

```text
Job-Application-Tracker/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md