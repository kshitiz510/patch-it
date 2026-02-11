from django.db import models


class Detection(models.Model):
    """Stores a pothole detection result."""

    image = models.ImageField(upload_to="detections/", blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    confidence = models.FloatField()
    severity = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
        default="medium",
    )
    bbox = models.JSONField(help_text="[x1, y1, x2, y2]")
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-detected_at"]

    def __str__(self):
        return f"Detection #{self.pk} ({self.confidence:.0%}) at {self.detected_at:%Y-%m-%d}"
