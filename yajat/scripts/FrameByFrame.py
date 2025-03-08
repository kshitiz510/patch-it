import cv2
from ultralytics import YOLO

model = YOLO(r"yajat\models\potholeDetectionYOLO6\weights\best.pt")


input_video = cv2.VideoCapture(r"yajat\data\testMedia\video.mp4") 

if not input_video.isOpened():
    print("Error: Could not open video file.")
    exit()

frame_width = int(input_video.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(input_video.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = int(input_video.get(cv2.CAP_PROP_FPS))

output_video = cv2.VideoWriter(r"yajat\data\outputs\outputVideo.mp4", cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

if not output_video.isOpened():
    print("Error: Could not open video writer.")
    exit()

frame_count = 0

while True:

    ret, frame = input_video.read()
    if not ret:
        break

    results = model(frame)

    annotated_frame = results[0].plot()

    output_video.write(annotated_frame)

    frame_count += 1

print(f"Total frames processed: {frame_count}")

input_video.release()
output_video.release()
cv2.destroyAllWindows()
