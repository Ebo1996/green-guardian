from django.contrib import admin
from .models import PlantScan, CropRecommendation


@admin.register(PlantScan)
class PlantScanAdmin(admin.ModelAdmin):
    list_display = ['id', 'disease_name', 'status', 'accuracy', 'created_at']
    list_filter = ['status', 'disease_name']
    search_fields = ['disease_name']
    readonly_fields = ['created_at']


@admin.register(CropRecommendation)
class CropRecommendationAdmin(admin.ModelAdmin):
    list_display = ['id', 'recommended_crop', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'created_at']
    list_filter = ['recommended_crop']
    readonly_fields = ['created_at']
