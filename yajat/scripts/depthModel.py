import torch
import cv2
import numpy as np
from torchvision import transforms
from matplotlib import pyplot as plt

model = torch.hub.load("intel-isl/MiDaS", "MiDaS")

image = cv2.imread("Image.jpg")

model.eval()

transform = transforms.Compose(
    [
        transforms.ToPILImage(),
        transforms.Resize((384, 384)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

inputImage = transform(image).unsqueeze(0)

with torch.no_grad():
    depth = model(inputImage)

depth = depth.squeeze().cpu().numpy()

plt.imshow(depth, cmap='inferno')
plt.colorbar()
plt.show()