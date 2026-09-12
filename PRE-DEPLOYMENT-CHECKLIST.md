# 🚀 Pre-Deployment Checklist

## ✅ **Do This BEFORE Deploying**

### 1. Generate Secure SECRET_KEY
```bash
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
**Action**: Copy the output. You'll use it in step 3.

---

### 2. Decide: Include ML Models in Repo?

**Option A (Recommended)**: Commit model files
```bash
# Remove models from .gitignore
code .gitignore  # Remove the line: backend/models_ml/*.pkl

# Commit the models
git add backend/models_ml/*.pkl backend/models_ml/label_encoder.pkl
git commit -m "Add trained ML models for deployment"
```

**Option B**: Upload manually to deployment platform
- Models: `backend/models_ml/crop_model.pkl` (3.5 MB)
- Encoder: `backend/models_ml/label_encoder.pkl` (1 KB)

---

### 3. Create Production Environment Variables

#### For Railway (Backend):
```
SECRET_KEY=<paste-from-step-1>
DEBUG=False
ALLOWED_HOSTS=your-app-name.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### For Vercel (Frontend):
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

### 4. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### 5. Deploy Backend (Railway)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Django
5. Click "Add PostgreSQL" database
6. Add environment variables from step 3
7. Click "Deploy"
8. Copy your Railway URL (e.g., `https://green-guardian-production.railway.app`)

---

### 6. Deploy Frontend (Vercel)
1. Go to https://vercel.com
2. Click "New Project" → Import from GitHub
3. Select your repository
4. Set **Root Directory**: `frontend`
5. Add environment variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend.railway.app/api` (from step 5)
6. Click "Deploy"

---

### 7. Update Backend CORS
After frontend is deployed:
1. Go back to Railway dashboard
2. Update `CORS_ALLOWED_ORIGINS` to include your Vercel URL:
   ```
   CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
   ```
3. Save and redeploy

---

### 8. Test Live Site
- [ ] Visit your Vercel URL
- [ ] Try plant disease scan
- [ ] Try crop recommendation
- [ ] Check scan history
- [ ] Test CSV/PDF export
- [ ] Verify rate limiting (try 11 scans quickly)

---

## 🎉 **You're Live!**

Add your live URLs to README:
```markdown
## 🌐 Live Demo
- **Frontend**: https://your-project.vercel.app
- **Backend API**: https://your-backend.railway.app/api
```

---

## 🐛 **Troubleshooting**

### "DisallowedHost at /"
→ Check `ALLOWED_HOSTS` matches your Railway domain

### "CORS policy: No 'Access-Control-Allow-Origin'"
→ Update `CORS_ALLOWED_ORIGINS` with your Vercel URL

### "ModuleNotFoundError"
→ Verify `requirements.txt` is complete and Railway build logs

### Models not loading
→ Commit model files to repo OR upload manually to Railway

---

## 📊 **Free Tier Limits**

| Platform | Free Tier | Note |
|---|---|---|
| Railway | $5 credit/month (~500 hours) | Pay-as-you-go after |
| Vercel | Unlimited deploys | 100 GB bandwidth/month |

---

**Total deployment time**: 15-20 minutes  
**Cost**: $0 (within free tiers)

Good luck! 🚀
