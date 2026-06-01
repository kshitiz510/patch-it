"""Detection API views."""

from pathlib import Path
import uuid

from django.conf import settings
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

ML_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = ML_ROOT / "models" / "pothole_yolo" / "weights" / "best.pt"


@api_view(["GET"])
def health_check(request):
    """Simple health check endpoint."""
    model_exists = DEFAULT_MODEL.exists()
    return Response({
        "status": "ok",
        "model_loaded": model_exists,
        "model_path": str(DEFAULT_MODEL),
    })


def estimate_from_file(image_file, detections=None):
    """Deterministic estimator used when trained segmentation weights are unavailable."""
    size_mb = max(getattr(image_file, "size", 0) / (1024 * 1024), 0.1)
    detection_count = len(detections or [])
    estimated_area = round(min(8.0, max(0.25, size_mb * 0.35 + detection_count * 0.65)), 2)
    if estimated_area >= 4 or detection_count >= 3:
        severity = "high"
        multiplier = 1.8
    elif estimated_area >= 1.5:
        severity = "medium"
        multiplier = 1.25
    else:
        severity = "low"
        multiplier = 0.8
    confidence = round(min(0.92, 0.58 + detection_count * 0.08 + min(size_mb, 5) * 0.03), 2)
    estimated_cost = round(estimated_area * 9000 * multiplier + 6000)
    return {
        "severity": severity,
        "estimatedArea": estimated_area,
        "estimatedCost": estimated_cost,
        "confidence": confidence,
    }


@api_view(["POST"])
@parser_classes([MultiPartParser])
def detect_pothole(request):
    """Run pothole detection on an uploaded image.

    POST /api/detect/  with multipart form 'image' field.
    Returns bounding box detections as JSON.
    """
    image_file = request.FILES.get("image")
    if not image_file:
        return Response({"error": "No image provided"}, status=400)

    if image_file.content_type and not image_file.content_type.startswith("image/"):
        return Response({"error": "Invalid image type"}, status=400)

    if not DEFAULT_MODEL.exists():
        return Response({
            "detections": [],
            "count": 0,
            **estimate_from_file(image_file, []),
            "model": "deterministic-media-estimator-v1",
            "warning": "YOLO weights not found; deterministic estimator used.",
        })

    # Save temp file
    media_dir = Path(settings.MEDIA_ROOT) / "temp"
    media_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(image_file.name).suffix or ".jpg"
    temp_path = media_dir / f"{uuid.uuid4().hex}{suffix}"

    with open(temp_path, "wb") as f:
        for chunk in image_file.chunks():
            f.write(chunk)

    try:
        from ultralytics import YOLO

        model = YOLO(str(DEFAULT_MODEL))
        results = model(str(temp_path))

        detections = []
        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                # Classify severity by confidence
                if conf >= 0.8:
                    severity = "high"
                elif conf >= 0.5:
                    severity = "medium"
                else:
                    severity = "low"

                detections.append({
                    "confidence": conf,
                    "bbox": box.xyxy[0].tolist(),
                    "class": result.names[int(box.cls[0])],
                    "severity": severity,
                })

        estimate = estimate_from_file(image_file, detections)

        return Response({
            "detections": detections,
            "count": len(detections),
            **estimate,
        })
    except ImportError:
        return Response({
            "detections": [],
            "count": 0,
            **estimate_from_file(image_file, []),
            "model": "deterministic-media-estimator-v1",
            "warning": "ultralytics not installed; deterministic estimator used.",
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    finally:
        if temp_path.exists():
            temp_path.unlink()


@api_view(["POST"])
def validate_bid(request):
    """Validate contractor bid reasonability against ML estimated cost."""
    estimated_cost = float(request.data.get("estimatedCost", 0) or 0)
    bid_amount = float(request.data.get("bidAmount", 0) or 0)
    if estimated_cost <= 0 or bid_amount <= 0:
        return Response({"error": "estimatedCost and bidAmount are required"}, status=400)

    ratio = bid_amount / estimated_cost
    risk_score = min(100, round(abs(1 - ratio) * 130))
    is_suspicious = ratio < 0.55 or ratio > 1.35
    if ratio < 0.4 or ratio > 1.75:
        action = "reject"
    elif is_suspicious:
        action = "review"
    else:
        action = "accept"

    return Response({
        "isSuspicious": is_suspicious,
        "riskScore": risk_score,
        "recommendedAction": action,
    })
