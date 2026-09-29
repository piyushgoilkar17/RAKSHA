from pathlib import Path
from ultralytics import YOLO

# Get absolute path to dataset_det/data.yaml relative to train.py
BASE_DIR = Path(__file__).resolve().parent
DATA_YAML = BASE_DIR / "dataset_det" / "data.yaml"

def main():
    model = YOLO("yolov8n.pt")
    model.train(
        data=str(DATA_YAML),
        epochs=100,
        imgsz=640,
        batch=16,
        project="runs/detect",
        name="aerorescue_person"
    )

if __name__ == "__main__":
    main()