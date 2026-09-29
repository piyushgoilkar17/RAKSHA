from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.classifier import classify_image


# Create FastAPI application
app = FastAPI(
    title="AeroRescue AI Backend",
    version="1.0.0"
)


# Allow requests from the Vite/React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------
# Health Check
# -----------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AeroRescue AI"
    }


# -----------------------------------------
# Root Endpoint
# -----------------------------------------
@app.get("/")
def root():
    return {
        "message": "AeroRescue AI Backend is running",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze",
            "docs": "/docs"
        }
    }


# -----------------------------------------
# Image Analysis Endpoint
# -----------------------------------------
@app.post("/analyze")
async def analyze_image_endpoint(
    file: UploadFile = File(...)
):
    # Check whether the uploaded file is an image
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )

    # Read image contents
    contents = await file.read()

    # Check for empty file
    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty"
        )

    try:
        # Send image bytes to YOLO classifier
        result = classify_image(contents)

        # Return YOLO detection result
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image classification failed: {str(e)}"
        )