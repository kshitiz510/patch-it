import cv2
import os

inputDir = r"yajat\Training\Normal"
outputDir = r"yajat\Training\Preprocessed"
os.makedirs(outputDir, exist_ok=True)

for img_name in os.listdir(inputDir):
    img = cv2.imread(os.path.join(inputDir, img_name))
    resized_img = cv2.resize(img, (384, 384))
    cv2.imwrite(os.path.join(outputDir, img_name), resized_img)
