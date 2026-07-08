# GreenGuardians 🌿

**Smart Plant Disease Detection & Crop Recommendation Platform**

Empowering farmers with AI-powered plant disease detection and intelligent crop recommendations based on soil and environmental data.

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS  |
| Backend   | Django 5+, Django REST Framework                    |
| Database  | PostgreSQL                                          |
| API Client| Axios                                               |

---

## Project Structure

```
green-guardian/
├── backend/                    # Django REST API
│   ├── .env                    # Environment variables (not committed)
│   ├── manage.py
│   ├── requirements.txt
│   ├── media/                  # Uploaded plant images
│   ├── greenguardian/          # Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── api/                    # REST API app
│       ├── models.py           # PlantScan, CropRecommendation
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       └── admin.py
└── frontend/                   # Next.js 14 app
    ├── .env.local              # API URL (not committed)
    └── src/app/
        ├── page.tsx            # Home page
        ├── layout.tsx
        ├── scanning/           # Plant scanning page
        ├── crop-recommendation/
        ├── recommendation/     # Disease info page
        ├── report/             # Full disease report
        ├── how-to-use/
        └── components/
            ├── Navbar.tsx
            └── Footer.tsx
```

---

## Setup & Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Database Setup

Create the PostgreSQL database:

```bash
# Windows (PowerShell)
$env:PGPASSWORD='your_password'; psql -U postgres -c "CREATE DATABASE greenguardian;"

# Linux / Mac
psql -U postgres -c "CREATE DATABASE greenguardian;"
```

---

### 2. Backend (Django)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy and edit the env file
# Edit backend/.env with your DB credentials

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

Backend runs at **http://localhost:8000**

---

### 3. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Environment Variables

### backend/.env

```env
SECRET_KEY=django-insecure-change-me
DEBUG=True
DB_NAME=greenguardian
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## API Endpoints

| Method | Endpoint               | Description                              |
|--------|------------------------|------------------------------------------|
| POST   | `/api/scan/`           | Upload plant image, get disease result   |
| POST   | `/api/crop-recommend/` | Submit soil/env data, get crop suggestion|
| GET    | `/api/scans/`          | List all scan history                    |
| GET    | `/api/scans/<id>/`     | Get a specific scan report               |

---

## Pages

| Route                  | Description                              |
|------------------------|------------------------------------------|
| `/`                    | Home — hero, features, stats, mission    |
| `/scanning`            | Upload & analyze plant image             |
| `/crop-recommendation` | Soil/env form → crop suggestion          |
| `/recommendation`      | Disease cards with treatment options     |
| `/report`              | Full disease report with treatments      |
| `/how-to-use`          | 4-step guide for users                   |

---

## Service URLs

| Service     | URL                           |
|-------------|-------------------------------|
| Frontend    | http://localhost:3000         |
| Backend API | http://localhost:8000/api     |
| Admin Panel | http://localhost:8000/admin   |
| Media Files | http://localhost:8000/media/  |

---

© 2025 GreenGuardians. All rights reserved.
