from ultralytics import YOLO
import torch
import os


def main():
    print(torch.cuda.is_available())
    print(torch.cuda.get_device_name(0))

    basePath = os.path.join("yajat", "data", "Datasets", "archive")

    trainPath = "D:/Patch-it/patch-it/yajat/data/Datasets/archive/train/images"
    valPath = "D:/Patch-it/patch-it/yajat/data/Datasets/archive/val/images"

    yaml_dir = os.path.dirname(os.path.join(basePath, "data.yaml"))
    os.makedirs(yaml_dir, exist_ok=True)

    print(trainPath)
    print(valPath)

    yaml_path = "D:/Patch-it/patch-it/yajat/data/Datasets/archive/data.yaml"


    with open(yaml_path, 'w') as yaml_file:
        yaml_file.write(f"train: {trainPath}\n")
        yaml_file.write(f"val: {valPath}\n")
        yaml_file.write("nc: 1\n") 
        yaml_file.write("names: ['pothole']\n") 

    model = YOLO("yolov8n")

    print(yaml_path)

    projectPath = "D:/Patch-it/patch-it/yajat/models"
    os.makedirs(projectPath, exist_ok=True)

    model.train(
        data=yaml_path,
        epochs=50,
        batch=16,
        imgsz=640,
        conf=0.25, 
        project=projectPath,  
        name='potholeDetectionYOLO',
        workers=8,
        amp=False,
        val=True)
    try:
        model.save("D:/Patch-it/patch-it/yajat/models/potholeDetectionYOLO/weights/best.pt")
        print("Model saved successfully")
    except:
        print("Error saving model")


if __name__ == "__main__":
    import torch.multiprocessing
    torch.multiprocessing.set_start_method("spawn")  
    main()