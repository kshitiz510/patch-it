"""Preprocess images by resizing to a uniform dimension.

Run from the ml/ directory:
    python scripts/preprocess.py
"""
import os
from pathlib import Path

import cv2

ML_ROOT = Path(__file__).resolve().parent.parent
INPUT_DIR = ML_ROOT / "data" / "raw"
OUTPUT_DIR = ML_ROOT / "data" / "processed"
TARGET_SIZE = (384, 384)


def preprocess():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    files = [f for f in INPUT_DIR.iterdir() if f.suffix.lower() in (".png", ".jpg", ".jpeg")]

    if not files:
        print(f"No images found in {INPUT_DIR}")
        return

    for img_path in files:
        img = cv2.imread(str(img_path))
        if img is None:
            print(f"Skipping unreadable file: {img_path.name}")
            continue
        resized = cv2.resize(img, TARGET_SIZE)
        cv2.imwrite(str(OUTPUT_DIR / img_path.name), resized)

    print(f"Preprocessed {len(files)} images → {OUTPUT_DIR}")


if __name__ == "__main__":
    preprocess()
