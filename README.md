<div align="center">

# GreenGuardians 🌿

**AI-Powered Plant Disease Detection & Crop Recommendation Platform**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django)](https://www.djangoproject.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.14-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://render.com)

Empowering farmers with real machine learning models for instant plant disease detection and intelligent crop recommendations based on soil and environmental data.

[Live Demo](#) • [Documentation](#-documentation) • [Report Bug](https://github.com/Ebo1996/green-guardian/issues) • [Request Feature](https://github.com/Ebo1996/green-guardian/issues)

</div>

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/Ebo1996/green-guardian?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Ebo1996/green-guardian?style=social)
![GitHub Issues](https://img.shields.io/github/issues/Ebo1996/green-guardian)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Ebo1996/green-guardian)
![Code Size](https://img.shields.io/github/languages/code-size/Ebo1996/green-guardian)
![Last Commit](https://img.shields.io/github/last-commit/Ebo1996/green-guardian)

---

## 👥 Authors

This project is collaboratively developed by:

- **[Ebisa Berhanu](https://github.com/Ebo1996)**
- **[Anam Tesfa](https://github.com/anotesfa)**
- **[Fenet Gizaw](https://github.com/Fenet254)**
- **[Solomon Tesfaye](https://github.com/AmSaved)**

---

## 🚀 Features

- **🦠 Plant Disease Detection** — Upload a photo, get instant diagnosis across **38 disease classes** using MobileNetV2 CNN
- **🌾 Crop Recommendation** — Enter soil parameters (N, P, K, pH, rainfall, etc.), get the best crop suggestion using a trained RandomForest model (**99.5% accuracy**)
- **📊 Full Reports** — Detailed treatment plans with organic and chemical options
- **📄 CSV/PDF Export** — Download diagnosis reports in multiple formats
- **📜 Scan History** — View all past scans and recommendations
- **⚡ Rate Limiting** — API protection (10 scans/hour, 20 crop recommendations/hour)
- **📱 Mobile Responsive** — Works seamlessly on all devices
- **🔒 Production Ready** — Secure, optimized, and deployment-ready
- **🆓 100% Free** — No account needed, no subscription

---

## 🧠 Machine Learning Models

| Model | Purpose | Architecture | Accuracy | Classes |
|---|---|---|---|---|
| **Disease Detection** | Identify plant diseases from images | MobileNetV2 CNN (HuggingFace) | High | 38 diseases |
| **Crop Recommendation** | Suggest optimal crop for given conditions | RandomForest Classifier (scikit-learn) | **99.5%** | 22 crops |

### Disease Model
- **Source**: [linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification](https://huggingface.co/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification)
- **Training Dataset**: PlantVillage (54,000+ images)
- **Supported Plants**: Tomato, Potato, Corn, Grape, Apple, Pepper, Strawberry, Peach, Cherry, Soybean, Squash, Blueberry, Raspberry, Orange, Coffee

### Crop Model
- **Training Dataset**: [Kaggle Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) (2,200 samples)
- **Supported Crops**: Rice, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Django 5.2, Django REST Framework |
| **Database** | MongoDB (via django-mongodb-backend) |
| **ML Framework** | PyTorch, scikit-learn, Hugging Face Transformers |
| **API Client** | Axios |
| **Production** | Gunicorn, WhiteNoise |

---

## 📁 Project Structure

```
green-guardian/
├── backend/                    # Django REST API
│   ├── api/                    # REST API endpoints
│   │   ├── models.py           # PlantScan, CropRecommendation
│   │   ├── views.py            # ML inference logic
│   │   └── urls.py             # API routes
│   ├── data/                   
│   │   └── Crop_recommendation.csv  # Training dataset
│   ├── models_ml/              # Trained models
│   │   ├── crop_model.pkl      # RandomForest (3.5 MB)
│   │   └── label_encoder.pkl   # Crop label encoder
│   ├── media/                  # Uploaded images
│   ├── train_crop_model.py     # Model training script
│   └── requirements.txt
│
└── frontend/                   # Next.js 14 app
    └── src/app/
        ├── page.tsx            # Landing page
        ├── (pages)/            # App pages (with Navbar/Footer)
        │   ├── scanning/       # Disease scanner
        │   ├── crop-recommendation/
        │   ├── report/         # Full diagnosis report
        │   └── how-to-use/
        └── components/
            ├── Navbar.tsx
            └── Footer.tsx
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB 4.4+** (or MongoDB Atlas account)

---

### 1️⃣ Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
# Windows: net start MongoDB
# Mac/Linux: brew services start mongodb-community

# MongoDB will run on mongodb://localhost:27017/
```

**Option B: MongoDB Atlas (Recommended for Production)**
```bash
# 1. Sign up at https://www.mongodb.com/cloud/atlas/register
# 2. Create a FREE M0 cluster (512 MB)
# 3. Create database user + password
# 4. Whitelist your IP (or 0.0.0.0/0 for development)
# 5. Get connection string (looks like):
#    mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file with:
cat > .env << EOF
SECRET_KEY=your-secret-key-here
DEBUG=True
MONGO_DB_NAME=greenguardian
MONGO_URI=mongodb://localhost:27017/
ALLOWED_HOSTS=localhost,127.0.0.1
EOF

# Generate a secure SECRET_KEY:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Run migrations
python manage.py migrate

# (Optional) Train crop model from scratch
# Download Crop_recommendation.csv from Kaggle and place in backend/data/
python train_crop_model.py

# Start server
python manage.py runserver
```

Backend runs at **http://localhost:8000**

---

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
# Create .env.local with:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Description | Rate Limit | Input | Output |
|---|---|---|---|---|---|
| `GET` | `/api/health/` | Health check | None | — | Status, models loaded |
| `POST` | `/api/scan/` | Analyze plant image | 10/hour | Image file | Disease, confidence, treatments |
| `POST` | `/api/crop-recommend/` | Get crop recommendation | 20/hour | N, P, K, temp, humidity, pH, rainfall | Crop name, confidence |
| `GET` | `/api/scans/` | List scan history | None | — | Array of past scans |
| `GET` | `/api/scans/<id>/` | Get scan report | None | Scan ID | Full report with treatments |

---

## 🖼️ Pages

| Route | Description |
|---|---|
| `/` | Landing page with features, live stats, FAQ |
| `/scanning` | Upload plant photo → instant AI diagnosis |
| `/crop-recommendation` | Soil/climate form → crop suggestion |
| `/report?id=<scan_id>` | Full disease report with CSV/PDF export |
| `/history` | View all past scans and recommendations |
| `/how-to-use` | Step-by-step user guide |

---

## 🚀 **Deployment**

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment guide.

### Quick Deploy (20 minutes)
1. **MongoDB Atlas**: Create free 512 MB cluster
2. **Backend**: Deploy to [Railway](https://railway.app) → Auto-detects Django
3. **Frontend**: Deploy to [Vercel](https://vercel.com) → Auto-detects Next.js
4. Set environment variables
5. Done! ✅

**Deployment checklist:**
- [x] Production server configured (Gunicorn)
- [x] Static files handling (WhiteNoise)
- [x] CORS properly configured
- [x] Rate limiting implemented
- [x] Secure SECRET_KEY generated
- [x] MongoDB support configured
- [x] ML models included
- [x] CSV/PDF export working

**Free Hosting:**
- Frontend: Vercel (Unlimited deploys, 100 GB bandwidth/month)
- Backend: Railway ($5 credit/month, ~500 hours)
- Database: MongoDB Atlas (512 MB free forever)

---

## 🔗 Service URLs

| Service | Development | Production |
|---|---|---|
| **Frontend** | http://localhost:3000 | https://your-app.vercel.app |
| **Backend API** | http://localhost:8000/api | https://your-app.railway.app/api |
| **Health Check** | http://localhost:8000/api/health/ | https://your-app.railway.app/api/health/ |
| **Database** | mongodb://localhost:27017/ | MongoDB Atlas cluster |

---

## 🧪 How the ML Models Work

### Disease Detection Flow
```
User uploads image
    ↓
Resize to 256×256 → Center crop to 224×224
    ↓
Normalize (mean=0.5, std=0.5) → Convert to tensor
    ↓
MobileNetV2 inference (38 output classes)
    ↓
Softmax → Top prediction + confidence
    ↓
Return disease name + treatment recommendations
```

### Crop Recommendation Flow
```
User enters soil/climate data (7 features)
    ↓
RandomForest model predicts (22 crop classes)
    ↓
LabelEncoder converts ID → crop name
    ↓
Return crop + confidence + description
```

---

## 📦 Model Files

The disease model is **downloaded automatically** from HuggingFace on first run and cached at:
```
~/.cache/huggingface/hub/models--linkanjarad--mobilenet_v2_1.0_224-plant-disease-identification/
```

The crop model is **already trained** and included in:
```
backend/models_ml/crop_model.pkl
backend/models_ml/label_encoder.pkl
```

To retrain the crop model from scratch:
```bash
cd backend
python train_crop_model.py
```

---

## 🎯 Key Features

✅ **Real ML models** (no mocks or placeholders)  
✅ **Production-ready** (secure keys, rate limiting, error handling)  
✅ **MongoDB integration** (NoSQL flexibility)  
✅ **CSV/PDF export** (download diagnosis reports)  
✅ **Scan history** (track all analyses)  
✅ **Rate limiting** (10/h scans, 20/h crop recommendations)  
✅ **Professional landing page** with animations  
✅ **Mobile-responsive design**  
✅ **Instant results** (< 3 seconds)  
✅ **Comprehensive treatment recommendations**  
✅ **Image validation** (size, type, max 10 MB)  
✅ **Confidence warnings** (alerts when accuracy < 60%)  
✅ **Live usage statistics**  

---

## 📝 Environment Variables

### `backend/.env` (Development)
```env
SECRET_KEY=<generate-with-command-below>
DEBUG=True
MONGO_DB_NAME=greenguardian
MONGO_URI=mongodb://localhost:27017/
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### `backend/.env` (Production - use platform env vars)
```env
SECRET_KEY=<50-char-random-string>
DEBUG=False
MONGO_DB_NAME=greenguardian
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
ALLOWED_HOSTS=your-app.railway.app,yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🤝 Contributing

This project is for educational and portfolio purposes. Contributions are welcome!

**To contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright © 2025 GreenGuardians Team**

Made with ❤️ by Ebisa Berhanu, Anam Tesfa, Fenet Gizaw, and Solomon Tesfaye.

---

## 🔮 Future Enhancements

- [ ] User authentication & personal dashboard
- [ ] Multilingual support (Amharic, Swahili, Hindi, Spanish)
- [ ] Fertilizer recommendation model
- [ ] Weather API integration for location-based suggestions
- [ ] Mobile app (React Native / Flutter)
- [ ] Offline mode with Service Workers
- [ ] Advanced analytics dashboard
- [ ] Community forum for farmers
- [ ] Integration with agricultural marketplaces
- [ ] Real-time disease alerts by region

---

## 🏆 Project Highlights

- ✅ **2 ML Models**: Pre-trained CNN + Custom RandomForest
- ✅ **38 Disease Classes**: Comprehensive plant disease coverage
- ✅ **22 Crop Recommendations**: Optimized for diverse conditions
- ✅ **99.5% Accuracy**: On crop recommendation model
- ✅ **Production Ready**: Secure, scalable, and optimized
- ✅ **Zero Cost Deployment**: Free tier hosting available
- ✅ **Full-Stack**: Next.js + Django + MongoDB
- ✅ **Real Impact**: Helping farmers make informed decisions

---

**Built with ❤️ for farmers and agriculture worldwide** 🌾

---

## 📧 Contact & Support

For questions, suggestions, or collaboration opportunities:

- **Open an Issue**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

### Connect with the Team:
- [Ebisa Berhanu](https://github.com/Ebo1996)
- [Anam Tesfa](https://github.com/anotesfa)
- [Fenet Gizaw](https://github.com/Fenet254)
- [Solomon Tesfaye](https://github.com/AmSaved)

---

## 🌟 Acknowledgments

- **PlantVillage Dataset** - For disease detection training data
- **Kaggle Community** - For crop recommendation dataset
- **Hugging Face** - For pre-trained MobileNetV2 model
- **Open Source Community** - For amazing tools and frameworks

---

**Live Demo**: Coming soon!

**⭐ If you find this project helpful, please consider giving it a star!**

---

**© 2025 GreenGuardians Team | Licensed under MIT License**

<div align="center">

Made with ❤️ for farmers and agriculture worldwide 🌾

[![GitHub](https://img.shields.io/badge/GitHub-Ebo1996-181717?logo=github)](https://github.com/Ebo1996)
[![GitHub](https://img.shields.io/badge/GitHub-anotesfa-181717?logo=github)](https://github.com/anotesfa)
[![GitHub](https://img.shields.io/badge/GitHub-Fenet254-181717?logo=github)](https://github.com/Fenet254)
[![GitHub](https://img.shields.io/badge/GitHub-AmSaved-181717?logo=github)](https://github.com/AmSaved)

⭐ Star this repo if you find it helpful! ⭐

</div>
