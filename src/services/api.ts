// src/services/api.ts

const API_BASE_URL = 'http://localhost:8001';

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: number[];
}

export interface AnalysisResult {
  detections: DetectionResult[];
  count: number;

  // Fields used by the frontend
  label: string;
  category: string;
  confidence: number;
  severity: string;
  imageUrl?: string;

  // YOLO bounding box
  boundingBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
  };
}


// -----------------------------------------
// Backend Health Check
// -----------------------------------------
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};


// -----------------------------------------
// Analyze Image using YOLO Backend
// -----------------------------------------
export const analyzeImage = async (
  file: File
): Promise<AnalysisResult> => {

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analysis failed with status ${response.status}`);
  }

  const data = await response.json();


  // -----------------------------------------
  // No detections found
  // -----------------------------------------
  if (!data.detections || data.detections.length === 0) {
    return {
      detections: [],
      count: 0,
      label: 'No Human Detected',
      category: 'Hazards',
      severity: 'LOW',
      confidence: 0,
      imageUrl: URL.createObjectURL(file),
    };
  }


  // -----------------------------------------
  // Find highest-confidence detection
  // -----------------------------------------
  const bestDetection = data.detections.reduce(
    (best: DetectionResult, current: DetectionResult) =>
      current.confidence > best.confidence ? current : best
  );

  const confidence = bestDetection.confidence;


  // -----------------------------------------
  // Determine severity
  // -----------------------------------------
  let severity = 'LOW';

  if (confidence >= 0.90) {
    severity = 'CRITICAL';
  } else if (confidence >= 0.75) {
    severity = 'HIGH';
  } else if (confidence >= 0.50) {
    severity = 'MEDIUM';
  }


  // -----------------------------------------
  // Convert YOLO bounding box
  // YOLO format:
  // [x1, y1, x2, y2]
  // -----------------------------------------
  const [x1, y1, x2, y2] = bestDetection.bbox;


  // -----------------------------------------
  // Return result to frontend
  // -----------------------------------------
  return {
    detections: data.detections,
    count: data.count,

    label: bestDetection.class,

    category:
      bestDetection.class.toLowerCase() === 'human'
        ? 'Survivor'
        : 'Hazards',

    severity: severity,

    confidence: confidence,

    imageUrl: URL.createObjectURL(file),

    boundingBox: {
      x: x1,
      y: y1,
      w: x2 - x1,
      h: y2 - y1,
      label: bestDetection.class,
    },
  };
};