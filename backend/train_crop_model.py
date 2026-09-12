"""
Crop Recommendation Model Trainer
==================================
Run this script ONCE to train and save the crop recommendation model.

Steps:
  1. Download the dataset from Kaggle:
     https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
  2. Place 'Crop_recommendation.csv' in:  backend/data/
  3. Run:  python train_crop_model.py
  4. This saves two files to backend/models_ml/:
       - crop_model.pkl       (trained RandomForestClassifier)
       - label_encoder.pkl    (LabelEncoder for crop names)

Requirements: scikit-learn, pandas, numpy, joblib
  pip install scikit-learn pandas numpy joblib
"""

import sys
from pathlib import Path

# ── guard: make sure required packages are available ──────────────────────────
try:
    import pandas as pd
    import numpy as np
    import joblib
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder
    from sklearn.metrics import accuracy_score, classification_report
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    print("Install with: pip install scikit-learn pandas numpy joblib")
    sys.exit(1)

# ── paths ─────────────────────────────────────────────────────────────────────
BASE_DIR  = Path(__file__).resolve().parent

# The CSV lives in backend/data/
CSV_PATH  = BASE_DIR / 'data' / 'Crop_recommendation.csv'

MODEL_DIR = BASE_DIR / 'models_ml'
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH   = MODEL_DIR / 'crop_model.pkl'
ENCODER_PATH = MODEL_DIR / 'label_encoder.pkl'

# ── load data ─────────────────────────────────────────────────────────────────
if not CSV_PATH.exists():
    print(f"[ERROR] Dataset not found at: {CSV_PATH}")
    print("Expected location: green-guardian/backend/data/Crop_recommendation.csv")
    sys.exit(1)

print("[1/5] Loading dataset...")
df = pd.read_csv(CSV_PATH)
print(f"      Loaded {len(df)} rows, {df['label'].nunique()} unique crops")
print(f"      Crops: {sorted(df['label'].unique())}")

# ── feature / label split ─────────────────────────────────────────────────────
FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
X = df[FEATURES].values
y_raw = df['label'].values

# ── encode labels ─────────────────────────────────────────────────────────────
print("[2/5] Encoding labels...")
le = LabelEncoder()
y = le.fit_transform(y_raw)
print(f"      Classes: {list(le.classes_)}")

# ── train / test split ────────────────────────────────────────────────────────
print("[3/5] Splitting into train/test (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── train model ───────────────────────────────────────────────────────────────
print("[4/5] Training RandomForestClassifier (100 trees)...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    random_state=42,
    n_jobs=-1,          # use all CPU cores
)
model.fit(X_train, y_train)

# ── evaluate ──────────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n      Test Accuracy: {acc:.4f} ({acc*100:.2f}%)")
print("\n      Classification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ── save ──────────────────────────────────────────────────────────────────────
print("[5/5] Saving model files...")
joblib.dump(model, MODEL_PATH)
joblib.dump(le, ENCODER_PATH)
print(f"      Saved: {MODEL_PATH}")
print(f"      Saved: {ENCODER_PATH}")
print("\n[✓] Done! Your crop model is ready.")
print("    Now start the Django server and test /api/crop-recommend/")
