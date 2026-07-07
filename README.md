# GreenGuardians 🌿

**Smart Plant Disease Detection & Crop Recommendation Platform**

Empowering farmers with AI-powered plant disease detection and intelligent crop recommendations based on soil and environmental data.

---

## Features

- 🔍 **Plant Disease Detection** — Upload a plant image to detect diseases (Phoma, Leaf Rust, Miner, Cercospora, Healthy)
- 🌾 **Crop Recommendation** — Enter soil nutrients (N, P, K) and environmental factors to get the best crop suggestion
- 📋 **Full Report** — Detailed disease report with organic and chemical treatment plans
- 📖 **How to Use Guide** — Step-by-step guide for first-time users
- 🌍 **Multi-language UI** — English, Amharic (አማርኛ), and Afaan Oromoo support

---

## Tech Stack

| Layer     | Technology                           |
|-----------|--------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend   | Django 4.2, Django REST Framework    |
| Database  | PostgreSQL                           |
| API Client| Axios                                |

---

## Project Structure

```
green-guardian/
├── backend/                    # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── media/                  # Uploaded plant images
│   ├── greenguardian/          # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── api/                    # REST API app
│       ├── models.py           # PlantScan, CropRecommendation
│       ├── serializers.py
│       ├── views.py            # API views
│       ├── urls.py
│       └── admin.py
└── frontend/                   # Next.js 14 app
    ├── src/app/
    │   ├── page.tsx            # Home page
    │   ├── layout.tsx          # Root layout
    │   ├── globals.css
    │   ├── scanning/           # Plant scanning page
    │   ├── crop-recommendation/# Crop recommendation form
    │   ├── recommendation/     # Disease recommendations list
    │   ├── report/             # Full disease report
    │   ├── how-to-use/         # Step-by-step guide
    │   └── components/
    │       ├── Navbar.tsx
    │       └── Footer.tsx
    ├── package.json
    ├── tailwind.config.js
    └── .env.local
```

---

## Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE greenguardian;
```

Or using the command line:

```bash
psql -U postgres -c "CREATE DATABASE greenguardian;"
```

---

### 2. Backend (Django)

```bash
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The backend will be available at **http://localhost:8000**

---

### 3. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | `/api/scan/`              | Upload plant image, get disease result |
| POST   | `/api/crop-recommend/`    | Submit soil/env data, get crop suggestion |
| GET    | `/api/scans/`             | List all scan history                |
| GET    | `/api/scans/<id>/`        | Get a specific scan report           |

### Example: Plant Scan

```bash
curl -X POST http://localhost:8000/api/scan/ \
  -F "image=@/path/to/plant.jpg"
```

### Example: Crop Recommendation

```bash
curl -X POST http://localhost:8000/api/crop-recommend/ \
  -H "Content-Type: application/json" \
  -d '{"nitrogen": 90, "phosphorus": 42, "potassium": 43, "temperature": 22, "humidity": 65, "ph": 6.5, "rainfall": 800}'
```

---

## Pages

| Route                  | Description                              |
|------------------------|------------------------------------------|
| `/`                    | Home — hero, features, stats, mission    |
| `/scanning`            | Upload & analyze plant image             |
| `/crop-recommendation` | Form for soil/env data → crop suggestion |
| `/recommendation`      | Disease cards with treatment options     |
| `/report`              | Full disease report with treatments      |
| `/how-to-use`          | 4-step guide for users                   |

---

## URLs

| Service     | URL                               |
|-------------|-----------------------------------|
| Frontend    | http://localhost:3000             |
| Backend API | http://localhost:8000/api         |
| Admin Panel | http://localhost:8000/admin       |
| Media Files | http://localhost:8000/media/      |

---

## Color Scheme

| Variable          | Hex       |
|-------------------|-----------|
| Primary Green     | `#28a745` |
| Dark Green        | `#218838` |
| Light Green       | `#e8f5e9` |

---

## License

© 2025 GreenGuardians. All rights reserved.
