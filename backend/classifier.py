from ultralytics import YOLO
from PIL import Image
import io


# Load the trained YOLO model
MODEL_PATH = "yolov8n.pt"

model = YOLO(MODEL_PATH)


def classify_image(image):
    """
    Run YOLO detection on uploaded image bytes.
    """

    # Convert image bytes to PIL image
    image = Image.open(io.BytesIO(image)).convert("RGB")

    # Run YOLO inference
    results = model(image, conf=0.5)

    detections = []

    for result in results:
        boxes = result.boxes

        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "class": model.names[class_id],
                "confidence": round(confidence, 4),
                "bbox": [
                    round(x1, 2),
                    round(y1, 2),
                    round(x2, 2),
                    round(y2, 2)
                ]
            })

    return {
        "detections": detections,
        "count": len(detections)
    }