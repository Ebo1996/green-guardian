import random
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import PlantScan, CropRecommendation
from .serializers import PlantScanSerializer, CropRecommendationSerializer


DISEASES = [
    {
        'name': 'Phoma',
        'status': 'Infected',
        'accuracy': 92.0,
        'organic_treatment': 'Apply copper-based fungicides or baking soda solution. Remove and destroy infected plant parts. Improve drainage and avoid overhead irrigation.',
        'chemical_treatment': 'Use systemic fungicides like Triazoles or Strobilurins. Follow manufacturer instructions carefully and rotate fungicide classes to prevent resistance.',
    },
    {
        'name': 'Leaf Rust',
        'status': 'Infected',
        'accuracy': 95.0,
        'organic_treatment': 'Bordeaux mixture or sulfur sprays work effectively. Improve air circulation and reduce leaf wetness by proper plant spacing and pruning.',
        'chemical_treatment': 'Triazole fungicides (e.g., Propiconazole) applied preventatively during rainy seasons. Repeat applications every 14 days as needed.',
    },
    {
        'name': 'Miner',
        'status': 'Infected',
        'accuracy': 87.0,
        'organic_treatment': 'Neem oil spray or introduce natural predators like parasitic wasps. Remove heavily infested leaves and dispose of them away from the garden.',
        'chemical_treatment': 'Apply Abamectin or Spinosad-based insecticides. Rotate chemicals to prevent resistance. Apply in early morning or evening to minimize beneficial insect exposure.',
    },
    {
        'name': 'Cercospora',
        'status': 'Infected',
        'accuracy': 89.0,
        'organic_treatment': 'Copper fungicides or potassium bicarbonate applied at first signs. Prune to improve air circulation and avoid wetting foliage during irrigation.',
        'chemical_treatment': 'Chlorothalonil or Mancozeb applied at first signs of disease, repeat every 10-14 days. Ensure thorough coverage of all leaf surfaces.',
    },
    {
        'name': 'Healthy',
        'status': 'Healthy',
        'accuracy': 98.0,
        'organic_treatment': 'Maintain good cultural practices: proper spacing, balanced nutrition with compost, regular monitoring, and watering at the base of plants.',
        'chemical_treatment': 'No chemical treatment needed. Focus on preventive measures such as crop rotation, resistant varieties, and maintaining plant health through nutrition.',
    },
]

CROPS = [
    {
        'name': 'Wheat',
        'description': 'Wheat is suitable for well-drained loamy soils with moderate nitrogen and potassium levels, thriving in cooler temperatures (10-25°C) and moderate rainfall (500-1000 mm).',
        'conditions': {
            'N': (50, 150), 'P': (20, 60), 'K': (100, 300),
            'rainfall': (500, 1000), 'humidity': (40, 80),
            'temperature': (10, 25), 'ph': (6, 7.5)
        }
    },
    {
        'name': 'Maize',
        'description': 'Maize grows well in warm climates with high rainfall (600-1200 mm) and fertile soils rich in nitrogen and potassium, preferring slightly acidic to neutral pH (5.5-7).',
        'conditions': {
            'N': (80, 180), 'P': (30, 80), 'K': (150, 400),
            'rainfall': (600, 1200), 'humidity': (50, 90),
            'temperature': (20, 35), 'ph': (5.5, 7)
        }
    },
    {
        'name': 'Rice',
        'description': 'Rice is ideal for high-rainfall areas (1000-2000 mm) with slightly acidic to neutral soils (pH 5-7), requiring consistent moisture and warm temperatures (20-35°C).',
        'conditions': {
            'N': (60, 160), 'P': (20, 70), 'K': (100, 350),
            'rainfall': (1000, 2000), 'humidity': (70, 95),
            'temperature': (20, 35), 'ph': (5, 7)
        }
    },
    {
        'name': 'Soybean',
        'description': 'Soybean prefers warm temperatures (20-30°C) and well-drained soils with balanced nutrients, ideal for crop rotation to improve soil fertility with a neutral pH (6-7).',
        'conditions': {
            'N': (40, 120), 'P': (25, 75), 'K': (120, 350),
            'rainfall': (500, 1000), 'humidity': (50, 85),
            'temperature': (20, 30), 'ph': (6, 7)
        }
    },
    {
        'name': 'Barley',
        'description': 'Barley is drought-tolerant and suitable for cooler climates (10-25°C) with moderate nutrient requirements and a wide pH range (6-8), performing well in semi-arid conditions.',
        'conditions': {
            'N': (50, 140), 'P': (15, 60), 'K': (80, 300),
            'rainfall': (400, 800), 'humidity': (40, 75),
            'temperature': (10, 25), 'ph': (6, 8)
        }
    },
]


class PlantScanView(APIView):
    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response(
                {'error': 'No image provided. Please upload an image file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        disease = random.choice(DISEASES)
        scan = PlantScan.objects.create(
            image=image,
            disease_name=disease['name'],
            status=disease['status'],
            accuracy=disease['accuracy'],
            organic_treatment=disease['organic_treatment'],
            chemical_treatment=disease['chemical_treatment'],
        )
        serializer = PlantScanSerializer(scan, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CropRecommendationView(APIView):
    def post(self, request):
        try:
            data = request.data
            N = float(data.get('nitrogen', 0))
            P = float(data.get('phosphorus', 0))
            K = float(data.get('potassium', 0))
            temperature = float(data.get('temperature', 0))
            humidity = float(data.get('humidity', 0))
            ph = float(data.get('ph', 0))
            rainfall = float(data.get('rainfall', 0))
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid input values. Please provide valid numbers for all fields.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find matching crops based on conditions
        suitable = [
            c for c in CROPS
            if c['conditions']['N'][0] <= N <= c['conditions']['N'][1]
            and c['conditions']['P'][0] <= P <= c['conditions']['P'][1]
            and c['conditions']['K'][0] <= K <= c['conditions']['K'][1]
            and c['conditions']['rainfall'][0] <= rainfall <= c['conditions']['rainfall'][1]
            and c['conditions']['humidity'][0] <= humidity <= c['conditions']['humidity'][1]
            and c['conditions']['temperature'][0] <= temperature <= c['conditions']['temperature'][1]
            and c['conditions']['ph'][0] <= ph <= c['conditions']['ph'][1]
        ]

        crop = random.choice(suitable) if suitable else random.choice(CROPS)

        rec = CropRecommendation.objects.create(
            nitrogen=N,
            phosphorus=P,
            potassium=K,
            temperature=temperature,
            humidity=humidity,
            ph=ph,
            rainfall=rainfall,
            recommended_crop=crop['name'],
            description=crop['description'],
        )
        serializer = CropRecommendationSerializer(rec)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ScanHistoryView(ListAPIView):
    queryset = PlantScan.objects.all().order_by('-created_at')
    serializer_class = PlantScanSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ReportDetailView(RetrieveAPIView):
    queryset = PlantScan.objects.all()
    serializer_class = PlantScanSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
