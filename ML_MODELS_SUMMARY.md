# 🧠 GreenGuardians ML Models Summary

## 📊 **You Have 2 Machine Learning Models**

---

## **Model 1: Plant Disease Detection** 🦠

### **Type**: Deep Learning - MobileNetV2 CNN
### **Source**: Hugging Face Pre-trained Model
### **Status**: ✅ **NOT trained by you** (downloaded from internet)

### **Details:**
- **Model Name**: `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`
- **Architecture**: MobileNetV2 Convolutional Neural Network
- **Training Dataset**: PlantVillage Dataset (54,000+ images)
- **Classes**: **38 plant diseases**
- **Size**: ~50 MB (cached in `~/.cache/huggingface/hub/`)
- **Location**: Downloaded automatically on first use

### **How It's Loaded:**
```python
from transformers import MobileNetV2ForImageClassification
model = MobileNetV2ForImageClassification.from_pretrained(
    'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification'
)
```

### **Supported Disease Classes (38):**
1. Apple Scab
2. Apple Black Rot
3. Cedar Apple Rust
4. Healthy Apple
5. Healthy Blueberry
6. Cherry Powdery Mildew
7. Healthy Cherry
8. Corn Gray Leaf Spot
9. Corn Common Rust
10. Corn Northern Leaf Blight
11. Healthy Corn
12. Grape Black Rot
13. Grape Esca (Black Measles)
14. Grape Leaf Blight
15. Healthy Grape
16. Orange Citrus Greening
17. Peach Bacterial Spot
18. Healthy Peach
19. Pepper Bacterial Spot
20. Healthy Pepper
21. Potato Early Blight
22. Potato Late Blight
23. Healthy Potato
24. Healthy Raspberry
25. Healthy Soybean
26. Squash Powdery Mildew
27. Strawberry Leaf Scorch
28. Healthy Strawberry
29. Tomato Bacterial Spot
30. Tomato Early Blight
31. Tomato Late Blight
32. Tomato Leaf Mold
33. Tomato Septoria Leaf Spot
34. Tomato Spider Mites
35. Tomato Target Spot
36. Tomato Yellow Leaf Curl Virus
37. Tomato Mosaic Virus
38. Healthy Tomato

### **Was It Trained?**
❌ **NO** - You didn't train this. It was already trained by someone else and published on Hugging Face.

---

## **Model 2: Crop Recommendation** 🌾

### **Type**: Traditional ML - Random Forest Classifier
### **Status**: ✅ **Trained by you** (using your training script)

### **Details:**
- **Algorithm**: RandomForestClassifier
- **Number of Trees**: 100
- **Features**: 7 (N, P, K, temperature, humidity, pH, rainfall)
- **Classes**: **22 crops**
- **Accuracy**: **99.5%** (on test data)
- **File Size**: 3.41 MB
- **Location**: `backend/models_ml/crop_model.pkl`

### **Training Dataset:**
- **Source**: Kaggle - Crop Recommendation Dataset
- **URL**: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
- **Samples**: 2,200 rows
- **Location**: `backend/data/Crop_recommendation.csv`

### **Training Script:**
- **File**: `backend/train_crop_model.py`
- **Command to retrain**: `python train_crop_model.py`

### **Supported Crops (22):**
1. Apple
2. Banana
3. Blackgram
4. Chickpea
5. Coconut
6. Coffee
7. Cotton
8. Grapes
9. Jute
10. Kidneybeans
11. Lentil
12. Maize
13. Mango
14. Mothbeans
15. Mungbean
16. Muskmelon
17. Orange
18. Papaya
19. Pigeonpeas
20. Pomegranate
21. Rice
22. Watermelon

### **Input Features:**
1. **N** - Nitrogen content (kg/ha)
2. **P** - Phosphorus content (kg/ha)
3. **K** - Potassium content (kg/ha)
4. **Temperature** - Average temperature (°C)
5. **Humidity** - Relative humidity (%)
6. **pH** - Soil pH value
7. **Rainfall** - Annual rainfall (mm)

### **Was It Trained?**
✅ **YES** - You trained this model using the training script and Kaggle dataset.

---

## 📦 **Model Files in Your Project**

```
backend/
├── models_ml/
│   ├── crop_model.pkl         (3.41 MB) ✅ Your trained model
│   ├── label_encoder.pkl      (< 1 KB)  ✅ Crop name encoder
│   └── .gitkeep
├── data/
│   └── Crop_recommendation.csv          ✅ Training dataset
└── train_crop_model.py                  ✅ Training script
```

**Disease Model Location:**
```
~/.cache/huggingface/hub/
└── models--linkanjarad--mobilenet_v2_1.0_224-plant-disease-identification/
    └── [~50 MB of model weights]
```

---

## 🔄 **Model Usage Flow**

### **Disease Detection:**
```
User uploads image
    ↓
Django receives image
    ↓
Load MobileNetV2 from HuggingFace cache
    ↓
Preprocess image (resize, normalize)
    ↓
Model predicts disease (38 classes)
    ↓
Return disease name + confidence + treatments
```

### **Crop Recommendation:**
```
User enters soil data (N, P, K, temp, humidity, pH, rainfall)
    ↓
Django receives parameters
    ↓
Load RandomForest from crop_model.pkl
    ↓
Model predicts best crop (22 options)
    ↓
Return crop name + confidence
```

---

## 📊 **Model Comparison**

| Feature | Disease Model | Crop Model |
|---|---|---|
| **Trained by you?** | ❌ No (pre-trained) | ✅ Yes |
| **Type** | Deep Learning (CNN) | Traditional ML (Random Forest) |
| **Size** | ~50 MB | 3.41 MB |
| **Classes** | 38 diseases | 22 crops |
| **Accuracy** | High (trained on 54K images) | 99.5% |
| **Input** | Image (224x224 RGB) | 7 numeric features |
| **Training Dataset** | PlantVillage (internet) | Kaggle CSV (you have it) |
| **Retrainable?** | ❌ No (would need thousands of images) | ✅ Yes (just run script) |
| **Location** | HuggingFace cache | `backend/models_ml/` |

---

## 🎯 **Summary**

### **Total Models: 2**

1. **Disease Detection (MobileNetV2)**
   - ❌ Not trained by you
   - ✅ Downloaded from internet (Hugging Face)
   - ✅ Production-ready, very accurate
   - ❌ Cannot easily retrain without massive dataset

2. **Crop Recommendation (Random Forest)**
   - ✅ Trained by you (using provided script)
   - ✅ Your model, your data
   - ✅ 99.5% accuracy
   - ✅ Can retrain anytime with new data

---

## 🔄 **How to Retrain Crop Model**

If you want to improve or update the crop model:

```bash
cd backend
python train_crop_model.py
```

This will:
1. Load `data/Crop_recommendation.csv`
2. Train a new RandomForest model
3. Save to `models_ml/crop_model.pkl`
4. Report accuracy metrics

---

## 🌐 **For Production (MongoDB Atlas)**

Both models work with MongoDB:
- ✅ Disease model: Cached locally, no database needed
- ✅ Crop model: Loaded from .pkl file, no database needed
- ✅ Predictions: Saved to MongoDB collections

---

**Your ML setup is production-ready!** 🚀

You have:
- 1 world-class pre-trained disease detector
- 1 custom-trained crop recommender
- Both working perfectly with MongoDB
