"""
GreenGuardians API Views
========================
PlantScanView          POST /api/scan/
    Uses Hugging Face MobileNetV2 CNN for plant disease classification.
    Rate limit: 10 scans per hour per IP

CropRecommendationView POST /api/crop-recommend/
    Uses a trained scikit-learn RandomForestClassifier loaded from
    backend/models_ml/crop_model.pkl + label_encoder.pkl.
    Falls back to rule-based range matching if model files are missing.
    Rate limit: 20 requests per hour per IP

ScanHistoryView        GET  /api/scans/
ReportDetailView       GET  /api/scans/<pk>/
HealthCheckView        GET  /api/health/
"""

import logging
import numpy as np
from pathlib import Path
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status

from .models import PlantScan, CropRecommendation
from .serializers import PlantScanSerializer, CropRecommendationSerializer

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Paths — pulled from Django settings so they can be overridden via .env
# ─────────────────────────────────────────────────────────────────────────────
MODEL_DIR          = getattr(settings, 'ML_MODELS_DIR',       Path(__file__).resolve().parent.parent / 'models_ml')
CROP_MODEL_PATH    = getattr(settings, 'CROP_MODEL_PATH',     MODEL_DIR / 'crop_model.pkl')
LABEL_ENCODER_PATH = getattr(settings, 'LABEL_ENCODER_PATH',  MODEL_DIR / 'label_encoder.pkl')
HF_DISEASE_MODEL   = getattr(settings, 'HF_DISEASE_MODEL_ID', 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification')


# ─────────────────────────────────────────────────────────────────────────────
# Disease treatment lookup
# Keys match the model's id2label exactly (lowercase for lookup via .lower())
# ─────────────────────────────────────────────────────────────────────────────
DISEASE_TREATMENTS = {
    # ── Apple ────────────────────────────────────────────────────────────────
    'apple scab': {
        'organic': 'Apply sulfur or copper sprays during bud break. Rake and destroy fallen leaves. Prune for air circulation.',
        'chemical': 'Myclobutanil or Trifloxystrobin from pink bud stage through petal fall. Apply every 7–14 days in wet weather.',
    },
    'apple with black rot': {
        'organic': 'Remove mummified fruit and dead wood. Apply copper fungicide in dormant season. Improve air circulation with pruning.',
        'chemical': 'Captan or Thiophanate-methyl from pink through cover sprays. Remove infected tissue before applying.',
    },
    'cedar apple rust': {
        'organic': 'Remove nearby juniper/cedar hosts if possible. Apply sulfur sprays from pink bud through petal fall.',
        'chemical': 'Myclobutanil or Propiconazole at pink stage, repeat every 7–10 days through petal fall.',
    },
    'healthy apple': {
        'organic': 'Your apple tree is healthy! Continue regular pruning, good air circulation, and orchard sanitation.',
        'chemical': 'No treatment needed. Maintain a preventive spray schedule at bud break next season.',
    },
    # ── Blueberry ────────────────────────────────────────────────────────────
    'healthy blueberry plant': {
        'organic': 'Your blueberry plant is healthy! Maintain acidic soil (pH 4.5–5.5), mulch well, and monitor for mummy berry.',
        'chemical': 'No treatment needed. Apply preventive fungicide at bud break if mummy berry has been an issue.',
    },
    # ── Cherry ───────────────────────────────────────────────────────────────
    'cherry with powdery mildew': {
        'organic': 'Apply potassium bicarbonate or sulfur sprays. Improve air circulation. Remove infected shoots in early spring.',
        'chemical': 'Myclobutanil or Trifloxystrobin at petal fall, repeat every 10–14 days as needed.',
    },
    'healthy cherry plant': {
        'organic': 'Your cherry tree is healthy! Maintain good pruning practices and remove mummified fruit after harvest.',
        'chemical': 'No treatment needed. Apply dormant copper spray before bud swell next season.',
    },
    # ── Corn ─────────────────────────────────────────────────────────────────
    'corn (maize) with cercospora and gray leaf spot': {
        'organic': 'Rotate crops with non-host plants. Manage crop residue. Plant resistant hybrids. Ensure balanced nutrition.',
        'chemical': 'Azoxystrobin or Propiconazole applied at VT/R1 stage. A single well-timed application is usually sufficient.',
    },
    'corn (maize) with common rust': {
        'organic': 'Plant resistant hybrids. Avoid late planting. Remove heavily infected plants to reduce spore load.',
        'chemical': 'Triazole fungicides (Propiconazole, Tebuconazole) at first sign of pustules.',
    },
    'corn (maize) with northern leaf blight': {
        'organic': 'Use resistant hybrids. Rotate crops. Till infected residue. Maintain balanced nitrogen nutrition.',
        'chemical': 'Azoxystrobin, Propiconazole, or Pyraclostrobin at first lesion appearance. Protect upper leaf canopy.',
    },
    'healthy corn (maize) plant': {
        'organic': 'Your corn crop is healthy! Keep up good fertility management and scout regularly during silking.',
        'chemical': 'No treatment needed. Scout at tasseling and apply fungicide only if disease pressure is observed.',
    },
    # ── Grape ────────────────────────────────────────────────────────────────
    'grape with black rot': {
        'organic': 'Remove mummified berries and infected canes. Apply copper or sulfur fungicides from bud break. Improve canopy airflow.',
        'chemical': 'Mancozeb or Myclobutanil from pre-bloom through fruit set. Apply every 7–14 days in wet weather.',
    },
    'grape with esca (black measles)': {
        'organic': 'Prune infected wood and seal wounds with pruning paste. Avoid large wounds. No effective cure — focus on prevention.',
        'chemical': 'No fully effective treatment. Focus on wound protection and avoiding vine stress.',
    },
    'grape with isariopsis leaf spot': {
        'organic': 'Remove infected leaves. Apply copper-based fungicide. Ensure drainage and airflow in the vineyard.',
        'chemical': 'Mancozeb or Copper oxychloride at 10–14 day intervals during the growing season.',
    },
    'healthy grape plant': {
        'organic': 'Your grape vine is healthy! Maintain canopy management and remove dropped leaves to prevent disease carry-over.',
        'chemical': 'No treatment needed. Apply a preventive copper spray at bud swell next season.',
    },
    # ── Orange ───────────────────────────────────────────────────────────────
    'orange with citrus greening': {
        'organic': 'No cure exists. Remove and destroy infected trees. Control Asian citrus psyllid with neem oil or reflective mulch.',
        'chemical': 'Control psyllid vector with Imidacloprid or Thiamethoxam. Trunk injection therapies can extend tree life but do not cure.',
    },
    # ── Peach ────────────────────────────────────────────────────────────────
    'peach with bacterial spot': {
        'organic': 'Apply copper sprays during dormancy and early spring. Avoid heavy nitrogen fertilisation. Plant in sheltered locations.',
        'chemical': 'Oxytetracycline or copper hydroxide from shuck split through cover spray period.',
    },
    'healthy peach plant': {
        'organic': 'Your peach tree is healthy! Thin fruit for air circulation and keep up with dormant pruning.',
        'chemical': 'No treatment needed. Apply a dormant copper spray before bloom for preventive protection.',
    },
    # ── Pepper ───────────────────────────────────────────────────────────────
    'bell pepper with bacterial spot': {
        'organic': 'Apply copper-based bactericides. Use disease-free seed. Avoid overhead irrigation. Remove infected leaves promptly.',
        'chemical': 'Copper hydroxide + Mancozeb every 7–10 days. Begin preventively during warm wet conditions.',
    },
    'healthy bell pepper plant': {
        'organic': 'Your pepper plant is healthy! Water at the base, ensure good air circulation, and monitor for aphids.',
        'chemical': 'No treatment needed. Apply a copper spray preventively before wet weather seasons.',
    },
    # ── Potato ───────────────────────────────────────────────────────────────
    'potato with early blight': {
        'organic': 'Apply copper fungicide or neem oil. Remove infected foliage. Avoid overhead irrigation. Maintain proper plant nutrition.',
        'chemical': 'Chlorothalonil or Mancozeb every 7–10 days from first symptoms. Rotate with Azoxystrobin for resistance management.',
    },
    'potato with late blight': {
        'organic': 'Apply copper-based fungicides immediately. Destroy infected plants and tubers — do not compost. Improve field drainage.',
        'chemical': 'Metalaxyl, Cymoxanil, or Dimethomorph-based products every 5–7 days in cool wet weather. Critical to act immediately.',
    },
    'healthy potato plant': {
        'organic': 'Your potato plant is healthy! Keep up good cultural practices and monitor for early signs of blight during wet seasons.',
        'chemical': 'No treatment needed. Use certified seed potatoes and practice crop rotation as prevention.',
    },
    # ── Raspberry ────────────────────────────────────────────────────────────
    'healthy raspberry plant': {
        'organic': 'Your raspberry canes are healthy! Prune out old canes after fruiting and maintain good air circulation.',
        'chemical': 'No treatment needed. Apply lime sulfur spray during dormancy as a preventive measure.',
    },
    # ── Soybean ──────────────────────────────────────────────────────────────
    'healthy soybean plant': {
        'organic': 'Your soybean crop is healthy! Rotate with non-legume crops and maintain balanced soil nutrition.',
        'chemical': 'No treatment needed. Scout at R1–R3 and apply fungicide only if disease pressure warrants it.',
    },
    # ── Squash ───────────────────────────────────────────────────────────────
    'squash with powdery mildew': {
        'organic': 'Apply baking soda solution (1 tbsp/gallon) or potassium bicarbonate. Neem oil sprays are effective in early stages.',
        'chemical': 'Myclobutanil or Trifloxystrobin at first sign. Ensure coverage of both leaf surfaces.',
    },
    # ── Strawberry ───────────────────────────────────────────────────────────
    'strawberry with leaf scorch': {
        'organic': 'Remove infected leaves. Apply copper fungicide. Avoid overhead watering. Improve air circulation.',
        'chemical': 'Captan or Myclobutanil at 10–14 day intervals. Remove old infected foliage before application.',
    },
    'healthy strawberry plant': {
        'organic': 'Your strawberry plants are healthy! Renew beds regularly, remove old foliage, and mulch to prevent soil splash.',
        'chemical': 'No treatment needed. Keep a preventive schedule during prolonged wet weather.',
    },
    # ── Tomato ───────────────────────────────────────────────────────────────
    'tomato with bacterial spot': {
        'organic': 'Apply copper-based sprays at first sign. Remove infected leaves. Avoid overhead irrigation and improve air circulation.',
        'chemical': 'Use copper hydroxide bactericides. Apply every 7–10 days during wet weather. Rotate with Mancozeb for resistance management.',
    },
    'tomato with early blight': {
        'organic': 'Apply neem oil or copper fungicide at early stages. Remove lower infected leaves. Mulch around plants to prevent soil splash.',
        'chemical': 'Chlorothalonil or Mancozeb applied every 7–14 days. Begin before disease onset during warm, humid weather.',
    },
    'tomato with late blight': {
        'organic': 'Apply copper-based fungicides immediately. Remove and destroy all infected tissue. Avoid wetting foliage. Improve air circulation.',
        'chemical': 'Metalaxyl + Mancozeb or Cymoxanil-based fungicides every 5–7 days in wet conditions. Act fast — this disease spreads rapidly.',
    },
    'tomato with leaf mold': {
        'organic': 'Improve ventilation. Remove infected leaves. Apply copper fungicide or potassium bicarbonate spray.',
        'chemical': 'Chlorothalonil or Trifloxystrobin. Ensure thorough coverage of leaf undersides where spores develop.',
    },
    'tomato with septoria leaf spot': {
        'organic': 'Remove infected lower leaves. Apply copper fungicide or neem oil. Mulch to reduce soil splash. Practice crop rotation.',
        'chemical': 'Chlorothalonil, Mancozeb, or copper-based fungicides every 7–10 days. Begin at first sign of spots.',
    },
    'tomato with spider mites or two-spotted spider mite': {
        'organic': 'Spray plants with strong water jets to dislodge mites. Apply neem oil or insecticidal soap. Introduce predatory mites.',
        'chemical': 'Apply Abamectin or Spiromesifen miticides. Rotate chemical classes to prevent resistance buildup.',
    },
    'tomato with target spot': {
        'organic': 'Remove infected leaves. Apply copper or neem oil sprays. Ensure adequate plant spacing for airflow.',
        'chemical': 'Azoxystrobin or Boscalid at 14-day intervals. Begin at first sign of lesions.',
    },
    'tomato yellow leaf curl virus': {
        'organic': 'Remove infected plants. Use reflective mulches to deter whiteflies. Introduce Encarsia formosa as a natural predator.',
        'chemical': 'Control whitefly vectors with Imidacloprid or Thiamethoxam. Apply systemic insecticides at transplanting.',
    },
    'tomato mosaic virus': {
        'organic': 'No cure. Remove and destroy infected plants immediately. Sanitize tools with 10% bleach. Control aphid vectors.',
        'chemical': 'No chemical cure. Control insect vectors with insecticides. Use virus-resistant varieties in future plantings.',
    },
    'healthy tomato plant': {
        'organic': 'Your tomato plant is healthy! Maintain good practices: proper spacing, compost nutrition, base watering, and regular monitoring.',
        'chemical': 'No treatment needed. Continue preventive measures such as crop rotation and resistant varieties.',
    },
    # ── Generic fallback ─────────────────────────────────────────────────────
    'healthy': {
        'organic': 'Your plant is healthy! Maintain good practices: proper spacing, balanced compost nutrition, water at the base, and monitor regularly.',
        'chemical': 'No chemical treatment needed. Focus on prevention: crop rotation, resistant varieties, and maintaining soil health.',
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Crop descriptions (for the 22 crops in the Kaggle dataset)
# ─────────────────────────────────────────────────────────────────────────────
CROP_DESCRIPTIONS = {
    'rice':        'Rice thrives in warm, waterlogged conditions with high rainfall (1000–2000 mm) and slightly acidic soils (pH 5–7). Ideal temperature: 20–35°C.',
    'maize':       'Maize grows well in warm climates with fertile soils rich in nitrogen and potassium and moderate to high rainfall (600–1200 mm). Preferred pH: 5.5–7.',
    'chickpea':    'Chickpea is drought-tolerant and suited for cool, dry conditions. It fixes atmospheric nitrogen and prefers well-drained neutral soils (pH 6–8).',
    'kidneybeans': 'Kidney beans prefer warm temperatures (18–27°C), well-drained loamy soil, and moderate rainfall. They fix nitrogen and improve soil fertility.',
    'pigeonpeas':  'Pigeon peas are drought-tolerant legumes suited for semi-arid tropics. They improve soil nitrogen and tolerate a wide pH range (5–7).',
    'mothbeans':   'Moth beans are highly drought-tolerant and grow in arid conditions with sandy or loamy soils. Excellent for low-rainfall regions.',
    'mungbean':    'Mung beans prefer warm temperatures (25–35°C), well-drained soils, and moderate rainfall. They are a fast-growing legume good for rotation.',
    'blackgram':   'Black gram prefers warm, humid conditions with moderate rainfall and well-drained loamy soils. A key pulse crop in tropical regions.',
    'lentil':      'Lentils grow in cool, semi-arid climates with low to moderate rainfall. They prefer well-drained loamy soils with neutral to slightly alkaline pH.',
    'pomegranate': 'Pomegranate is drought-resistant and thrives in hot, dry climates. It tolerates a wide soil pH range and requires minimal water once established.',
    'banana':      'Banana requires a warm, humid climate with high rainfall (1200–2200 mm) or irrigation. It grows best in rich, well-drained loamy soils.',
    'mango':       'Mango thrives in tropical and subtropical climates with a pronounced dry season for flowering. Prefers deep, well-drained loam.',
    'grapes':      'Grapes prefer warm, dry summers and cool winters with excellent drainage. Optimal pH: 5.5–7.',
    'watermelon':  'Watermelon needs warm temperatures (24–35°C), sandy loam soils, and moderate rainfall. Requires a long frost-free season.',
    'muskmelon':   'Muskmelon prefers hot, dry conditions with warm nights. Sandy loam soils with pH 6–7 and adequate water supply give the best yields.',
    'apple':       'Apple requires a temperate climate with cold winters for dormancy. Grows best in deep, well-drained loamy soils with pH 6–7.',
    'orange':      'Orange thrives in subtropical climates with moderate rainfall and temperatures of 15–30°C. Prefers well-drained sandy loam to clay loam soils.',
    'papaya':      'Papaya grows rapidly in tropical and subtropical climates. Needs well-drained soils, warmth (22–32°C), and protection from frost and waterlogging.',
    'coconut':     'Coconut palms thrive in tropical coastal environments with high humidity, warm temperatures (27–32°C), and ample rainfall or groundwater.',
    'cotton':      'Cotton requires a long warm growing season (180–200 frost-free days), moderate rainfall, and well-drained loamy soils with pH 5.8–7.',
    'jute':        'Jute grows in hot, humid climates with high rainfall (1000–2000 mm) and loamy soils. Requires flooded conditions during part of its growth cycle.',
    'coffee':      'Coffee grows in tropical highland climates with temperatures of 18–24°C, high humidity, and well-drained, slightly acidic soils.',
}


def _get_crop_description(crop_name: str) -> str:
    return CROP_DESCRIPTIONS.get(
        crop_name.lower(),
        f'{crop_name} is well-suited to your soil and environmental conditions.'
    )


# ─────────────────────────────────────────────────────────────────────────────
# Treatment lookup helper
# ─────────────────────────────────────────────────────────────────────────────

def _get_treatments(cleaned_label: str) -> tuple:
    key = cleaned_label.lower()
    if key in DISEASE_TREATMENTS:
        t = DISEASE_TREATMENTS[key]
        return t['organic'], t['chemical']
    for disease_key, treatments in DISEASE_TREATMENTS.items():
        if disease_key in key or key in disease_key:
            return treatments['organic'], treatments['chemical']
    if 'healthy' in key:
        t = DISEASE_TREATMENTS['healthy']
        return t['organic'], t['chemical']
    return (
        'Apply general-purpose copper-based or neem oil fungicide. Remove infected leaves and improve air circulation around the plant.',
        'Consult a local agricultural extension office for a precise chemical treatment recommendation for this specific disease.',
    )


# ─────────────────────────────────────────────────────────────────────────────
# Model loader helpers  — loaded ONCE at Django startup, not per request
# ─────────────────────────────────────────────────────────────────────────────

def _load_crop_model():
    """Load trained RandomForest + LabelEncoder from disk."""
    try:
        import joblib
        model   = joblib.load(CROP_MODEL_PATH)
        encoder = joblib.load(LABEL_ENCODER_PATH)
        logger.info("[GreenGuardians] Crop recommendation model loaded successfully from %s", CROP_MODEL_PATH)
        return model, encoder
    except FileNotFoundError:
        logger.warning(
            "[GreenGuardians] crop_model.pkl not found at %s. "
            "Run `python train_crop_model.py` to generate it. "
            "Using rule-based fallback for now.",
            CROP_MODEL_PATH,
        )
        return None, None
    except Exception as exc:
        logger.error("[GreenGuardians] Failed to load crop model: %s", exc)
        return None, None


def _load_disease_classifier():
    """
    Load the MobileNetV2 plant disease model directly with PyTorch.
    Uses the locally cached Hugging Face weights — no pipeline() needed,
    which avoids the transformers v5 image-processor compatibility issue.
    
    NOTE: Only loads in DEBUG mode (local development).
    Disabled in production due to Render free tier memory constraints.
    PyTorch + MobileNetV2 requires ~400MB which exceeds 512MB free tier limits.
    """
    from django.conf import settings
    
    # Only load disease model in DEBUG mode (local development)
    if not settings.DEBUG:
        logger.warning(
            "[GreenGuardians] Disease model loading disabled in production. "
            "PyTorch models require too much memory (>400MB) for Render's 512MB free tier."
        )
        return None
    
    # Load model for local development
    try:
        import torch
        from transformers import MobileNetV2ForImageClassification
        
        logger.info("[GreenGuardians] Loading disease model for local development...")
        model = MobileNetV2ForImageClassification.from_pretrained(
            HF_DISEASE_MODEL,
            local_files_only=False,
        )
        model.eval()
        logger.info("[GreenGuardians] Plant disease classifier loaded: %s", HF_DISEASE_MODEL)
        return model
    except Exception as exc:
        logger.error(
            "[GreenGuardians] Failed to load disease classifier (%s): %s. "
            "Ensure `transformers` and `torch` are installed.",
            HF_DISEASE_MODEL, exc,
        )
        return None


# Module-level singletons — initialised once when Django imports this module
_crop_model, _label_encoder = _load_crop_model()
_disease_classifier          = _load_disease_classifier()


# ─────────────────────────────────────────────────────────────────────────────
# Fallback crops for rule-based matching when model file is absent
# ─────────────────────────────────────────────────────────────────────────────
_FALLBACK_CROPS = [
    {'name': 'Wheat',   'conditions': {'N': (50,150),  'P': (20,60),  'K': (100,300), 'rainfall': (500,1000),  'humidity': (40,80),  'temperature': (10,25), 'ph': (6,7.5)}},
    {'name': 'Maize',   'conditions': {'N': (80,180),  'P': (30,80),  'K': (150,400), 'rainfall': (600,1200),  'humidity': (50,90),  'temperature': (20,35), 'ph': (5.5,7)}},
    {'name': 'Rice',    'conditions': {'N': (60,160),  'P': (20,70),  'K': (100,350), 'rainfall': (1000,2000), 'humidity': (70,95),  'temperature': (20,35), 'ph': (5,7)}},
    {'name': 'Soybean', 'conditions': {'N': (40,120),  'P': (25,75),  'K': (120,350), 'rainfall': (500,1000),  'humidity': (50,85),  'temperature': (20,30), 'ph': (6,7)}},
    {'name': 'Barley',  'conditions': {'N': (50,140),  'P': (15,60),  'K': (80,300),  'rainfall': (400,800),   'humidity': (40,75),  'temperature': (10,25), 'ph': (6,8)}},
]


# ─────────────────────────────────────────────────────────────────────────────
# Views
# ─────────────────────────────────────────────────────────────────────────────

@method_decorator(ratelimit(key='ip', rate='10/h', method='POST'), name='dispatch')
class PlantScanView(APIView):
    """
    POST /api/scan/
    Accepts a multipart image upload.
    Returns AI disease diagnosis using the Hugging Face MobileNetV2 CNN.
    Rate limited to 10 scans per hour per IP address.
    """

    ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/jpg'}
    MAX_SIZE_MB   = 10

    def post(self, request):
        image_file = request.FILES.get('image')

        # ── input validation ──────────────────────────────────────────────────
        if not image_file:
            return Response(
                {'error': 'No image provided. Please upload an image file.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file.content_type not in self.ALLOWED_TYPES:
            return Response(
                {'error': f'Unsupported file type "{image_file.content_type}". Please upload a JPG, PNG, or WEBP image.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file.size > self.MAX_SIZE_MB * 1024 * 1024:
            return Response(
                {'error': f'File too large. Maximum size is {self.MAX_SIZE_MB} MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── model availability check ──────────────────────────────────────────
        if _disease_classifier is None:
            return Response(
                {
                    'error': (
                        'Disease detection model is not available. '
                        'Run: pip install transformers torch torchvision '
                        'then restart the Django server.'
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # ── run inference ─────────────────────────────────────────────────────
        try:
            import torch
            from PIL import Image as PILImage

            # Pre-processing: resize to 256, center-crop to 224, normalize to [-1, 1]
            # Matches the preprocessor_config.json: mean=0.5, std=0.5
            from torchvision import transforms
            preprocess = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ])

            pil_image   = PILImage.open(image_file).convert('RGB')
            
            # Basic validation: check if image contains plant-like features
            # Simple heuristic: detect skin tones (common in human/animal photos)
            import numpy as np
            img_array = np.array(pil_image.resize((224, 224)))
            
            if len(img_array.shape) == 3:
                r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
                
                # Skin tone detection (catches most human/animal photos)
                skin_pixels = np.sum((r > 95) & (g > 40) & (b > 20) & 
                                   (r > g) & (r > b) & 
                                   (np.abs(r.astype(int) - g.astype(int)) > 15))
                total_pixels = img_array.shape[0] * img_array.shape[1]
                skin_ratio = skin_pixels / total_pixels
                
                # If more than 30% of the image is skin-toned, reject it
                if skin_ratio > 0.3:
                    return Response(
                        {'error': 'Please upload a plant leaf image. This system is designed for plant disease detection only, not for humans or animals.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            
            tensor      = preprocess(pil_image).unsqueeze(0)   # shape: [1, 3, 224, 224]

            with torch.no_grad():
                outputs     = _disease_classifier(pixel_values=tensor)
                logits      = outputs.logits                    # shape: [1, 38]
                probs       = torch.softmax(logits, dim=-1)[0]  # shape: [38]
                top_idx     = int(torch.argmax(probs))
                confidence  = round(float(probs[top_idx]) * 100, 1)

            # id2label comes from the model config (38 PlantVillage classes)
            id2label   = _disease_classifier.config.id2label
            raw_label  = id2label[top_idx]           # e.g. "Tomato with Late Blight"
            clean_label = raw_label                  # already human-readable
            is_healthy  = 'healthy' in raw_label.lower()
            plant_status = 'Healthy' if is_healthy else 'Infected'

            organic_tx, chemical_tx = _get_treatments(clean_label)

        except Exception as exc:
            logger.error("[GreenGuardians] Disease inference error: %s", exc, exc_info=True)
            return Response(
                {'error': 'Failed to analyse the image. Please try again with a clear, well-lit plant photo.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Reset file pointer before Django saves it to disk
        image_file.seek(0)

        # ── persist to DB ─────────────────────────────────────────────────────
        scan = PlantScan.objects.create(
            image=image_file,
            disease_name=clean_label,
            status=plant_status,
            accuracy=confidence,
            organic_treatment=organic_tx,
            chemical_treatment=chemical_tx,
        )

        serializer = PlantScanSerializer(scan, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────

@method_decorator(ratelimit(key='ip', rate='20/h', method='POST'), name='dispatch')
class CropRecommendationView(APIView):
    """
    POST /api/crop-recommend/
    Accepts soil + environmental parameters.
    Returns the best crop using a trained RandomForestClassifier.
    Falls back to rule-based matching if the model files are missing.
    Rate limited to 20 requests per hour per IP address.
    """

    def post(self, request):
        # ── parse inputs ──────────────────────────────────────────────────────
        try:
            data        = request.data
            N           = float(data.get('nitrogen',    0))
            P           = float(data.get('phosphorus',  0))
            K           = float(data.get('potassium',   0))
            temperature = float(data.get('temperature', 0))
            humidity    = float(data.get('humidity',    0))
            ph          = float(data.get('ph',          0))
            rainfall    = float(data.get('rainfall',    0))
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid input values. Please provide valid numbers for all fields.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        confidence    = None
        used_ml_model = False
        predicted_crop = None

        # ── ML model path ─────────────────────────────────────────────────────
        if _crop_model is not None and _label_encoder is not None:
            try:
                features      = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
                encoded_pred  = _crop_model.predict(features)[0]
                probabilities = _crop_model.predict_proba(features)[0]
                confidence    = round(float(max(probabilities)) * 100, 1)

                predicted_crop = _label_encoder.inverse_transform([encoded_pred])[0]
                description    = _get_crop_description(predicted_crop)
                used_ml_model  = True

            except Exception as exc:
                logger.error(f"[GreenGuardians] Crop model inference error: {exc}", exc_info=True)
                predicted_crop = None  # fall through to rule-based

        # ── rule-based fallback (no model file yet) ───────────────────────────
        if not used_ml_model:
            suitable = [
                c for c in _FALLBACK_CROPS
                if (
                    c['conditions']['N'][0]           <= N           <= c['conditions']['N'][1]
                    and c['conditions']['P'][0]       <= P           <= c['conditions']['P'][1]
                    and c['conditions']['K'][0]       <= K           <= c['conditions']['K'][1]
                    and c['conditions']['rainfall'][0]    <= rainfall    <= c['conditions']['rainfall'][1]
                    and c['conditions']['humidity'][0]    <= humidity    <= c['conditions']['humidity'][1]
                    and c['conditions']['temperature'][0] <= temperature <= c['conditions']['temperature'][1]
                    and c['conditions']['ph'][0]          <= ph          <= c['conditions']['ph'][1]
                )
            ]
            chosen         = suitable[0] if suitable else _FALLBACK_CROPS[0]
            predicted_crop = chosen['name']
            description    = _get_crop_description(predicted_crop)

        # ── persist & respond ─────────────────────────────────────────────────
        rec = CropRecommendation.objects.create(
            nitrogen=N,
            phosphorus=P,
            potassium=K,
            temperature=temperature,
            humidity=humidity,
            ph=ph,
            rainfall=rainfall,
            recommended_crop=predicted_crop,
            description=description,
        )

        response_data = CropRecommendationSerializer(rec).data

        # Surface real confidence score to the frontend when ML model is active
        if confidence is not None:
            response_data['confidence'] = confidence
            response_data['model']      = 'RandomForestClassifier'
        else:
            response_data['model'] = 'rule-based (run train_crop_model.py for ML predictions)'

        return Response(response_data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────

class HealthCheckView(APIView):
    """GET /api/health/ — backend health check."""
    def get(self, request):
        return Response({
            'status': 'healthy',
            'disease_model_loaded': _disease_classifier is not None,
            'crop_model_loaded': _crop_model is not None,
            'timestamp': timezone.now().isoformat(),
        })


class ScanHistoryView(ListAPIView):
    """GET /api/scans/ — all scans ordered newest first."""
    queryset         = PlantScan.objects.all().order_by('-created_at')
    serializer_class = PlantScanSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReportDetailView(RetrieveAPIView):
    """GET /api/scans/<pk>/ — single scan record."""
    queryset         = PlantScan.objects.all()
    serializer_class = PlantScanSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
