"""Train YOLO model for pothole detection.

Run from the ml/ directory:
    python scripts/train.py
"""
import os
from pathlib import Path

from ultralytics import YOLO
import torch

# Resolve paths relative to ml/ root
ML_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ML_ROOT / "data"
MODELS_DIR = ML_ROOT / "models"


def main():
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    train_path = DATA_DIR / "train" / "images"
    val_path = DATA_DIR / "val" / "images"
    yaml_path = DATA_DIR / "data.yaml"

    # Auto-generate data.yaml
    yaml_path.parent.mkdir(parents=True, exist_ok=True)
    with open(yaml_path, "w") as f:
        f.write(f"train: {train_path}\n")
        f.write(f"val: {val_path}\n")
        f.write("nc: 1\n")
        f.write("names: ['pothole']\n")

    model = YOLO("yolov8n")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    model.train(
        data=str(yaml_path),
        epochs=50,
        batch=16,
        imgsz=640,
        conf=0.25,
        project=str(MODELS_DIR),
        name="pothole_yolo",
        workers=8,
        amp=False,
        val=True,
    )

    best_path = MODELS_DIR / "pothole_yolo" / "weights" / "best.pt"
    if best_path.exists():
        print(f"Model saved at: {best_path}")
    else:
        print("Warning: best.pt not found after training.")


if __name__ == "__main__":
    import torch.multiprocessing
    torch.multiprocessing.set_start_method("spawn")
    main()