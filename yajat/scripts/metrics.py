def evaluate_model():
    from ultralytics import YOLO

    model = YOLO(r"yajat\models\potholeDetectionYOLO6\weights\best.pt")
    metrics = model.val()

    precision = metrics.box.p.mean()  # Mean precision over all classes
    recall = metrics.box.r.mean()  # Mean recall over all classes
    map50 = metrics.box.map50  # mAP at IoU=0.5
    map95 = metrics.box.map  # mAP at IoU=0.5:0.95

    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"mAP50: {map50:.4f}")
    print(f"mAP50-95: {map95:.4f}")

if __name__ == "__main__":
    evaluate_model()
