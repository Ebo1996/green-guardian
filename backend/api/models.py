from django.db import models


class PlantScan(models.Model):
    STATUS_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Infected', 'Infected'),
    ]

    image = models.ImageField(upload_to='scans/')
    disease_name = models.CharField(max_length=200)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    accuracy = models.FloatField()
    organic_treatment = models.TextField(blank=True)
    chemical_treatment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.disease_name} - {self.status} ({self.accuracy}%)"

    class Meta:
        ordering = ['-created_at']


class CropRecommendation(models.Model):
    nitrogen = models.FloatField()
    phosphorus = models.FloatField()
    potassium = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    ph = models.FloatField()
    rainfall = models.FloatField()
    recommended_crop = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recommended_crop} (N={self.nitrogen}, P={self.phosphorus}, K={self.potassium})"

    class Meta:
        ordering = ['-created_at']
