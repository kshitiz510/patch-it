from transformers import pipeline
from PIL import Image
import torch
import os
import sys
import cv2
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))
print(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

def process_video(input_path, output_path):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = pipeline(task="depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device=0 if device == "cuda" else -1)
    
    cap = cv2.VideoCapture(input_path)
    
    if not cap.isOpened():
        print("Error: Could not open video.")
        return
    
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        depth = pipe(image)["depth"]
        depth = np.array(depth)
        depth = cv2.cvtColor(depth, cv2.COLOR_GRAY2BGR)  # Convert to 3-channel
        
        out.write(depth)
    
    cap.release()
    out.release()
    print(f"Processed video saved at: {output_path}")

if __name__ == "__main__":
    input_video_path = r'yajat/data/testMedia/video.mp4'  # Change to your input video path
    output_video_path = r'yajat/data/outputs/outputVideoDepth.mp4'  # Change to your output video path
    process_video(input_video_path, output_video_path)