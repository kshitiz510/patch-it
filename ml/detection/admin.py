from django.contrib import admin

from .models import Detection


@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ("id", "confidence", "severity", "detected_at")
    list_filter = ("severity",)
    readonly_fields = ("detected_at",)
