"""Run YOLO inference on a single image.

Run from the ml/ directory:
    python scripts/predict.py --image data/raw/image.png
"""
import argparse
from pathlib import Path

import cv2
import matplotlib.pyplot as plt
from ultralytics import YOLO

ML_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = ML_ROOT / "models" / "pothole_yolo" / "weights" / "best.pt"


def predict(image_path: str, model_path: str = None):
    model = YOLO(model_path or str(DEFAULT_MODEL))
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not read image at {image_path}")
        return

    results = model(img)

    for result in results:
        annotated = result.plot()
        plt.imshow(cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB))
        plt.axis("off")
        plt.show()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pothole detection inference")
        parser.add_argument("--image", help="Path to input image")
        parser.add_argument("--source", help="Alias for --image")
    parser.add_argument("--model", default=None, help="Path to YOLO weights")
    args = parser.parse_args()
        image_path = args.image or args.source
        if not image_path:
                parser.error("--image or --source is required")
        predict(image_path, args.model)