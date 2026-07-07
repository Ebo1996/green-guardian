from rest_framework import serializers
from .models import PlantScan, CropRecommendation


class PlantScanSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PlantScan
        fields = [
            'id', 'image', 'image_url', 'disease_name', 'status',
            'accuracy', 'organic_treatment', 'chemical_treatment', 'created_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class CropRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropRecommendation
        fields = '__all__'
