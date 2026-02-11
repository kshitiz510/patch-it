"""Detection app URL routes."""

from django.urls import path
from . import views

app_name = 'detection'

urlpatterns = [
    path('detect/', views.detect_pothole, name='detect'),
    path('health/', views.health_check, name='health'),
]
