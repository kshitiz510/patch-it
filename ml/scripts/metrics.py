"""Evaluate trained YOLO model and print metrics.

Run from the ml/ directory:
    python scripts/metrics.py
"""
from pathlib import Path

from ultralytics import YOLO

ML_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = ML_ROOT / "models" / "pothole_yolo" / "weights" / "best.pt"


def evaluate_model(model_path: str = None):
    model = YOLO(model_path or str(DEFAULT_MODEL))
    metrics = model.val()

    print(f"Precision: {metrics.box.p.mean():.4f}")
    print(f"Recall:    {metrics.box.r.mean():.4f}")
    print(f"mAP@0.5:   {metrics.box.map50:.4f}")
    print(f"mAP@0.5-0.95: {metrics.box.map:.4f}")


if __name__ == "__main__":
    evaluate_model()
