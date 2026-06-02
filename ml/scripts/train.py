"""Train YOLO model for pothole detection.

Run from the ml/ directory:
    python scripts/train.py
"""
import os
from pathlib import Path

# Fix Windows CUDA memory fragmentation before importing torch
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

from ultralytics import YOLO
import torch

# Resolve paths relative to ml/ root
ML_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ML_ROOT / "data"
YOLO_DIR = DATA_DIR / "yolo"
MODELS_DIR = ML_ROOT / "models"


def main():
    cuda_ok = torch.cuda.is_available()
    print(f"CUDA available: {cuda_ok}")
    if cuda_ok:
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        free_mem = torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_allocated(0)
        print(f"Free VRAM: {free_mem / 1024**3:.2f} GB")
        # Clear any cached allocations left by previous runs
        torch.cuda.empty_cache()

    yaml_path = YOLO_DIR / "data.yaml" if (YOLO_DIR / "data.yaml").exists() else DATA_DIR / "data.yaml"

    if not yaml_path.exists():
        train_path = DATA_DIR / "train" / "images"
        val_path = DATA_DIR / "val" / "images"

        # Auto-generate data.yaml as a fallback
        yaml_path.parent.mkdir(parents=True, exist_ok=True)
        with open(yaml_path, "w", encoding="utf-8") as f:
            f.write(f"train: {train_path}\n")
            f.write(f"val: {val_path}\n")
            f.write("nc: 1\n")
            f.write("names: ['pothole']\n")

    model = YOLO("yolov8n")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # Use GPU if available; batch=4 is safe for 4GB VRAM with display driver overhead
    device = 0 if cuda_ok else "cpu"
    batch = 4 if cuda_ok else 8

    try:
        model.train(
            data=str(yaml_path),
            epochs=50,
            batch=batch,
            imgsz=640,
            conf=0.25,
            project=str(MODELS_DIR),
            name="pothole_yolo",
            exist_ok=True,          # overwrite instead of creating pothole_yolo-2/-3 etc.
            device=device,
            workers=0,              # 0 = no multiprocessing; avoids Windows paging file exhaustion
            amp=False,
            val=True,
        )
    except torch.cuda.OutOfMemoryError:
        print("\n⚠️  GPU OOM — retrying on CPU (close browser/apps to free VRAM next time)\n")
        torch.cuda.empty_cache()
        model = YOLO("yolov8n")
        model.train(
            data=str(yaml_path),
            epochs=50,
            batch=8,
            imgsz=640,
            conf=0.25,
            project=str(MODELS_DIR),
            name="pothole_yolo",
            exist_ok=True,
            device="cpu",
            workers=0,
            amp=False,
            val=True,
        )

    best_path = MODELS_DIR / "pothole_yolo" / "weights" / "best.pt"
    if best_path.exists():
        print(f"\n✅ Model saved at: {best_path}")
    else:
        print("⚠️  Warning: best.pt not found after training.")


if __name__ == "__main__":
    import torch.multiprocessing
    torch.multiprocessing.set_start_method("spawn")
    main()