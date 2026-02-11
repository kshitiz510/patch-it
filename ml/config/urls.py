"""URL configuration for Patch-It ML service."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('detection.urls')),
]
