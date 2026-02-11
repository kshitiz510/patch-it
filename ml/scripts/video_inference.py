"""Run YOLO pothole detection on a video, frame by frame.

Run from the ml/ directory:
    python scripts/video_inference.py --input data/video.mp4 --output data/output.mp4
"""
import argparse
from pathlib import Path

import cv2
from ultralytics import YOLO

ML_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MODEL = ML_ROOT / "models" / "pothole_yolo" / "weights" / "best.pt"


def process_video(input_path: str, output_path: str, model_path: str = None):
    model = YOLO(model_path or str(DEFAULT_MODEL))
    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
        print(f"Error: Could not open video: {input_path}")
        return

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))

    if not out.isOpened():
        print("Error: Could not open video writer.")
        cap.release()
        return

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = model(frame)
        out.write(results[0].plot())
        frame_count += 1

    cap.release()
    out.release()
    print(f"Processed {frame_count} frames → {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Video pothole detection")
    parser.add_argument("--input", required=True, help="Path to input video")
    parser.add_argument("--output", required=True, help="Path to output video")
    parser.add_argument("--model", default=None, help="Path to YOLO weights")
    args = parser.parse_args()
    process_video(args.input, args.output, args.model)
