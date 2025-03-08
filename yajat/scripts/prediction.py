from ultralytics import YOLO
import cv2

model = YOLO(r"yajat\models\potholeDetectionYOLO6\weights\best.pt")

img = cv2.imread(r"yajat\Training\Normal\image2.png")
results = model(img)


from matplotlib import pyplot as plt


for result in results:
    annotated_image = result.plot()
    plt.imshow(annotated_image)
    plt.axis('off') 
    plt.show()  