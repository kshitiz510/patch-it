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
        return Response(
            {"error": "Model weights not found. Train the model first (see ml/scripts/train.py)."},
            status=503,
        )

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

        return Response({
            "detections": detections,
            "count": len(detections),
        })
    except ImportError:
        return Response(
            {"error": "ultralytics not installed. Run: pip install ultralytics"},
            status=503,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    finally:
        if temp_path.exists():
            temp_path.unlink()
