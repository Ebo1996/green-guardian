# GreenGuardians - Deployment Guide

## 🚀 Quick Deploy (Recommended)

### **Option 1: Railway (Easiest - Free Tier)**

#### Backend (Django + PostgreSQL)
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `green-guardian` repository
5. Railway will auto-detect Django and create PostgreSQL database
6. Add these environment variables in Railway dashboard:
   ```
   SECRET_KEY=<generate-with-command-below>
   DEBUG=False
   ALLOWED_HOSTS=your-app.railway.app
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   DATABASE_URL=<auto-provided-by-railway>
   ```
7. Generate SECRET_KEY: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
8. Deploy! Railway will run migrations automatically

#### Frontend (Next.js)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import from GitHub
3. Select `green-guardian` repository
4. Set Root Directory: `frontend`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
6. Deploy!

**Total time: 15-20 minutes**

---

### **Option 2: Render (Also Free)**

#### Backend
1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn greenguardian.wsgi:application`
   - **Environment**: Python 3
4. Add environment variables (same as Railway above)
5. Create PostgreSQL database in Render
6. Deploy!

#### Frontend
Same as Vercel (option 1)

---

## ⚠️ **Critical: Before Deployment**

### 1. Generate Secure SECRET_KEY
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy output and use it in production `.env` or platform environment variables.

### 2. Update Environment Variables

**Backend** (create `backend/.env.production`):
```env
SECRET_KEY=<your-generated-key-here>
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Database (provided by Railway/Render)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Or individual DB vars:
DB_NAME=greenguardian
DB_USER=<provided-by-platform>
DB_PASSWORD=<provided-by-platform>
DB_HOST=<provided-by-platform>
DB_PORT=5432
```

**Frontend** (`.env.production`):
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### 3. Update CORS in Production

After deploying frontend, update backend env:
```env
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-domain.com
```

---

## 📦 **ML Models in Production**

### Disease Model (MobileNetV2)
- Auto-downloads from Hugging Face on first request (~50 MB)
- Cached in container filesystem
- **Warning**: Railway/Render free tier may have limited storage
- **Alternative**: Pre-download and include in deployment (increases slug size)

### Crop Model (RandomForest)
- Files: `backend/models_ml/crop_model.pkl` and `label_encoder.pkl`
- **Important**: These files are gitignored by default
- **Solution**: Either:
  1. Remove them from `.gitignore` (commit the 3.5 MB files)
  2. Or upload them manually to your deployment platform
  3. Or train them on first deployment with `python train_crop_model.py`

**Recommended**: Remove from `.gitignore` and commit to repo for reliability.

---

## 🔒 **Security Checklist**

- [ ] `DEBUG=False` in production
- [ ] Strong random `SECRET_KEY` (not the default)
- [ ] `ALLOWED_HOSTS` set to actual domain (not `*`)
- [ ] `CORS_ALLOWED_ORIGINS` restricted to your frontend URL only
- [ ] Database password is strong and secret
- [ ] `.env` files are in `.gitignore` (use platform env vars instead)
- [ ] HTTPS enabled (automatic on Vercel/Railway/Render)
- [ ] Rate limiting active (already configured)

---

## 🧪 **Test Production Build Locally**

### Backend
```bash
cd backend
pip install gunicorn whitenoise

# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn greenguardian.wsgi:application --bind 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm run build
npm start  # Production server on port 3000
```

---

## 📊 **Expected Costs (Free Tier Limits)**

| Platform | Service | Free Tier | Limits |
|---|---|---|---|
| **Railway** | Backend + DB | 500 hrs/month | $5 credit/month, then paid |
| **Vercel** | Frontend | Unlimited | 100 GB bandwidth/month |
| **Render** | Backend + DB | 750 hrs/month | Sleeps after 15 min inactivity |

**Recommendation**: Railway (backend) + Vercel (frontend) = Best free tier experience

---

## 🐛 **Common Deployment Issues**

### 1. "DisallowedHost at /"
**Fix**: Add your domain to `ALLOWED_HOSTS` in environment variables

### 2. "CORS policy: No 'Access-Control-Allow-Origin'"
**Fix**: Add your frontend URL to `CORS_ALLOWED_ORIGINS`

### 3. "ModuleNotFoundError: No module named 'X'"
**Fix**: Make sure `requirements.txt` includes all dependencies

### 4. Static files not loading
**Fix**: Run `python manage.py collectstatic` before starting server (already in Procfile)

### 5. Database migration errors
**Fix**: Railway/Render run migrations automatically via Procfile `release` command

### 6. ML models not loading
**Fix**: Ensure model files are committed OR train on first deploy

---

## 🔄 **Deployment Workflow**

```
Local Development
    ↓
Git Push to GitHub
    ↓
Auto-deploys to Railway (backend) + Vercel (frontend)
    ↓
✅ Live in ~2 minutes
```

---

## 📝 **Environment Variables Quick Reference**

### Backend (Railway/Render)
```
SECRET_KEY=<random-50-char-string>
DEBUG=False
ALLOWED_HOSTS=your-backend.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
DATABASE_URL=<auto-provided>
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## ✅ **Deployment Readiness Checklist**

- [x] Gunicorn installed
- [x] WhiteNoise configured for static files
- [x] Procfile created
- [x] CORS properly configured
- [x] Rate limiting implemented
- [ ] Generate new SECRET_KEY before deploying
- [ ] Set DEBUG=False in production
- [ ] Commit ML model files OR upload manually
- [ ] Test production build locally
- [ ] Push to GitHub
- [ ] Deploy to Railway + Vercel
- [ ] Test live deployment

---

## 🎉 **After Successful Deployment**

1. Test all features on live site
2. Update README with live demo links
3. Add screenshots
4. Share on LinkedIn/Portfolio
5. Monitor logs for errors

---

**Need help?** Check platform documentation:
- Railway: https://docs.railway.app/
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs

---

© 2025 GreenGuardians
