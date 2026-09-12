from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
    path('scan/', views.PlantScanView.as_view(), name='plant-scan'),
    path('crop-recommend/', views.CropRecommendationView.as_view(), name='crop-recommend'),
    path('scans/', views.ScanHistoryView.as_view(), name='scan-history'),
    path('scans/<int:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
]
