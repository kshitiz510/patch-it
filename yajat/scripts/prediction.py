from ultralytics import YOLO
import cv2

model = YOLO(r"yajat\models\potholeDetectionYOLO6\weights\best.pt")

img = cv2.imread("Image.jpg")
results = model(img)


from matplotlib import pyplot as plt


for result in results:
    annotated_image = result.plot()  # Get the annotated image as a NumPy array
    plt.imshow(annotated_image)
    plt.axis('off')  # Hide axes
    plt.show()