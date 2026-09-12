# MongoDB Migration Guide

## ✅ **MongoDB is Already Installed!**

You have MongoDB v8.0.12 installed locally.

---

## 🔄 **Migration Steps**

### 1. Install Python MongoDB Dependencies

```bash
cd backend
pip uninstall djongo sqlparse -y
pip install pymongo==4.10.1 django-mongodb-backend==5.2.4
```

### 2. Update `.env` File

Your `.env` is already updated to:
```env
MONGO_DB_NAME=greenguardian
MONGO_URI=mongodb://localhost:27017/
```

### 3. Start MongoDB Service

```powershell
# Check if MongoDB is running
Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

# If not running, start it
net start MongoDB
```

### 4. Delete Old Migration Files

```powershell
Remove-Item -Recurse -Force backend/api/migrations/__pycache__
Remove-Item backend/api/migrations/0001_initial.py
```

Keep only `__init__.py` in migrations folder.

### 5. Create Fresh Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 6. Restart Development Server

```bash
python manage.py runserver
```

---

## 📊 **Data Migration (PostgreSQL → MongoDB)**

If you have existing data in PostgreSQL:

### Option A: Export/Import Manually
```bash
# 1. Export from PostgreSQL
python manage.py dumpdata api.PlantScan api.CropRecommendation > data_backup.json

# 2. Switch to MongoDB (update settings.py)

# 3. Import to MongoDB
python manage.py loaddata data_backup.json
```

### Option B: Start Fresh
Just run migrations on MongoDB - no data transfer needed.

---

## 🌐 **Production: MongoDB Atlas (Recommended)**

### 1. Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free M0 cluster (512 MB storage, free forever)
3. Select your region
4. Create cluster (takes 3-5 minutes)

### 2. Get Connection String
1. In Atlas dashboard → "Connect" button
2. Choose "Connect your application"
3. Copy the connection string:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 3. Set Environment Variable

**Railway**:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=greenguardian
```

**Render**:
Same environment variables as above.

---

## 🔍 **Verify MongoDB Connection**

### Check Local Connection
```python
# Run in Python shell
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
print(client.list_database_names())  # Should show ['admin', 'config', 'local']
```

### Check Django Connection
```bash
python manage.py check
python manage.py dbshell
```

---

## 📋 **Comparison: PostgreSQL vs MongoDB**

| Feature | PostgreSQL | MongoDB |
|---|---|---|
| **Type** | Relational (SQL) | Document (NoSQL) |
| **Schema** | Fixed schema | Flexible schema |
| **Queries** | SQL | MongoDB Query Language |
| **Django Support** | Native | via django-mongodb-backend |
| **Free Hosting** | Railway, Render | MongoDB Atlas (512 MB) |
| **Scaling** | Vertical | Horizontal (sharding) |
| **Best For** | Complex relations, ACID | Large JSON-like data, flexibility |

---

## ⚠️ **Important Notes**

### Django MongoDB Backend Limitations
- No support for complex JOINs (use embedded documents instead)
- No support for `select_related()` and `prefetch_related()`
- Some Django ORM features may not work as expected
- Full-text search works differently

### Your Models Are Simple (Good!)
Your current models (`PlantScan`, `CropRecommendation`) are simple and work perfectly with MongoDB:
- No foreign keys
- No complex relationships
- Mostly independent records
- Perfect for NoSQL!

---

## 🐛 **Troubleshooting**

### "pymongo.errors.ServerSelectionTimeoutError"
**Fix**: MongoDB service is not running
```powershell
net start MongoDB
```

### "django_mongodb_backend module not found"
**Fix**: Reinstall dependencies
```bash
pip install django-mongodb-backend==5.2.4 pymongo==4.10.1
```

### "Django version conflict"
**Fix**: Upgrade Django to 5.2+
```bash
pip install Django==5.2.5
```

---

## 💡 **Why MongoDB for This Project?**

### ✅ **Advantages**
1. **Free Cloud Hosting**: MongoDB Atlas gives 512 MB free (better than PostgreSQL free tiers)
2. **Flexible Schema**: Easy to add new fields without migrations
3. **JSON-Native**: Stores Django model data naturally as documents
4. **Horizontal Scaling**: Better for high-traffic apps
5. **No Complex Relations**: Your models don't need JOINs anyway

### ⚠️ **Considerations**
1. Less mature Django integration than PostgreSQL
2. Some advanced Django ORM features don't work
3. Different query syntax if using raw queries

---

## 🚀 **Quick Start (After Installation)**

```bash
# 1. Start MongoDB
net start MongoDB

# 2. Create migrations
cd backend
python manage.py makemigrations
python manage.py migrate

# 3. Run server
python manage.py runserver
```

Visit http://localhost:8000/api/health/ to verify!

---

## 📖 **Resources**

- **Django MongoDB Backend Docs**: https://github.com/mongodb-labs/django-mongodb-backend
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **PyMongo Docs**: https://pymongo.readthedocs.io/

---

**Status**: MongoDB configured ✅  
**Next**: Run migrations and test!
