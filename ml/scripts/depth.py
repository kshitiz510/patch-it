"""Depth estimation on video using Depth-Anything-V2.

Run from the ml/ directory:
    python scripts/depth.py --input data/video.mp4 --output data/depth_output.mp4
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from transformers import pipeline


def process_video(input_path: str, output_path: str):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = pipeline(
        task="depth-estimation",
        model="depth-anything/Depth-Anything-V2-Small-hf",
        device=0 if device == "cuda" else -1,
    )

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error: Could not open video: {input_path}")
        return

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))

    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        depth = pipe(image)["depth"]
        depth_arr = np.array(depth)
        depth_bgr = cv2.cvtColor(depth_arr, cv2.COLOR_GRAY2BGR)
        out.write(depth_bgr)
        frame_count += 1

    cap.release()
    out.release()
    print(f"Processed {frame_count} frames → {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Depth estimation on video")
    parser.add_argument("--input", required=True, help="Path to input video")
    parser.add_argument("--output", required=True, help="Path to output video")
    args = parser.parse_args()
    process_video(args.input, args.output)