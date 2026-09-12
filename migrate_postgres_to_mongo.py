#!/usr/bin/env python
"""
Migrate data from PostgreSQL to MongoDB
Run this script to transfer your existing scan data
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greenguardian.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Temporarily use PostgreSQL
os.environ['TEMP_USE_POSTGRES'] = 'true'

django.setup()

from api.models import PlantScan, CropRecommendation
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

def migrate_to_mongodb():
    print("🔄 Starting migration from PostgreSQL to MongoDB...")
    
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['greenguardian']
    
    # Get collections
    plantscan_collection = db['api_plantscan']
    crop_collection = db['api_croprecommendation']
    
    # Clear existing MongoDB data (if any)
    plantscan_collection.delete_many({})
    crop_collection.delete_many({})
    print("✓ Cleared existing MongoDB data")
    
    # Migrate PlantScans
    try:
        from django.db import connection
        connection.settings_dict['ENGINE'] = 'django.db.backends.postgresql'
        connection.settings_dict['NAME'] = 'greenguardian'
        connection.settings_dict['USER'] = 'postgres'
        connection.settings_dict['PASSWORD'] = 'ebisa1234'
        connection.settings_dict['HOST'] = 'localhost'
        connection.settings_dict['PORT'] = '5432'
        
        # Query PostgreSQL directly
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, image, disease_name, status, accuracy, 
                       organic_treatment, chemical_treatment, created_at
                FROM api_plantscan
                ORDER BY created_at DESC
            """)
            rows = cursor.fetchall()
            
            migrated_scans = 0
            for row in rows:
                doc = {
                    '_id': ObjectId(),
                    'image': row[1],
                    'disease_name': row[2],
                    'status': row[3],
                    'accuracy': float(row[4]),
                    'organic_treatment': row[5],
                    'chemical_treatment': row[6],
                    'created_at': row[7],
                }
                plantscan_collection.insert_one(doc)
                migrated_scans += 1
            
            print(f"✓ Migrated {migrated_scans} plant scans")
            
            # Migrate CropRecommendations
            cursor.execute("""
                SELECT nitrogen, phosphorus, potassium, temperature, 
                       humidity, ph, rainfall, recommended_crop, description, created_at
                FROM api_croprecommendation
                ORDER BY created_at DESC
            """)
            rows = cursor.fetchall()
            
            migrated_crops = 0
            for row in rows:
                doc = {
                    '_id': ObjectId(),
                    'nitrogen': float(row[0]),
                    'phosphorus': float(row[1]),
                    'potassium': float(row[2]),
                    'temperature': float(row[3]),
                    'humidity': float(row[4]),
                    'ph': float(row[5]),
                    'rainfall': float(row[6]),
                    'recommended_crop': row[7],
                    'description': row[8] or '',
                    'created_at': row[9],
                }
                crop_collection.insert_one(doc)
                migrated_crops += 1
            
            print(f"✓ Migrated {migrated_crops} crop recommendations")
            print(f"\n🎉 Migration complete!")
            print(f"   - Plant Scans: {migrated_scans}")
            print(f"   - Crop Recommendations: {migrated_crops}")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        print("\nNote: Make sure PostgreSQL is running and credentials are correct")
        return False
    
    return True

if __name__ == '__main__':
    print("=" * 60)
    print("  PostgreSQL → MongoDB Data Migration")
    print("=" * 60)
    print()
    
    confirm = input("⚠️  This will copy data from PostgreSQL to MongoDB.\n   Continue? (yes/no): ")
    
    if confirm.lower() == 'yes':
        success = migrate_to_mongodb()
        if success:
            print("\n✅ You can now use MongoDB!")
            print("   Old PostgreSQL data is still intact (not deleted)")
    else:
        print("❌ Migration cancelled")
