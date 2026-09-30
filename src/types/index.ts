export type UserRole = 'ADMIN' | 'MISSION_COMMANDER' | 'RESPONDER' | 'VIEWER';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  callsign: string;
}

export type DroneStatus = 'ACTIVE' | 'STANDBY' | 'RETURNING' | 'CHARGING' | 'OFFLINE' | 'EMERGENCY';
export type NavMode = 'GPS_MODE' | 'GPS_GUIDED' | 'GPS_DENIED_SLAM' | 'RETURN_TO_HOME' | 'MANUAL_OVERRIDE' | 'EMERGENCY_LAND';
export type NavigationMode = NavMode;

export interface Drone {
  droneId: string;
  model: string;
  name: string;
  status: DroneStatus;
  navMode: NavMode;
  battery: number; // 0-100%
  latitude: number;
  longitude: number;
  altitude: number; // meters
  speed: number; // m/s
  heading: number; // degrees 0-360
  signalStrength: number; // dBm e.g. -62
  gpsStatus: 'LOCKED' | 'RTK_FIX' | 'DEGRADED' | 'DENIED';
  imuStatus: 'CALIBRATED' | 'ALIGNING' | 'ERROR';
  cameraStatus: 'STREAMING' | 'STANDBY' | 'OFFLINE';
  thermalStatus: 'CALIBRATED' | 'STANDBY' | 'ACTIVE';
  currentMissionId: string;
  flightTimeMinutes: number;
  distanceTravelledKm: number;
  zone: string;
  lastSeen: string;
}

export type DisasterType = 
  | 'Flood + Structural Damage' 
  | 'Urban Earthquake' 
  | 'Wildfire & Smoke Hazard' 
  | 'Landslide & Mudflow' 
  | 'Industrial Chemical Leak'
  | 'Flood'
  | 'Earthquake'
  | 'Fire'
  | 'Landslide'
  | 'Cyclone';

export type MissionStatus = 'ACTIVE' | 'PLANNING' | 'PAUSED' | 'COMPLETED' | 'ABORTED' | 'SCHEDULED' | 'IN_PROGRESS';
export type MissionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE' | 'LOW';
export type SearchPattern = 'LAWNMOWER_GRID' | 'LAWNMOWER' | 'EXPANDING_SQUARE' | 'SECTOR_SEARCH' | 'PERIMETER_RECON' | 'PERIMETER';

export interface SearchAreaPoint {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id: string;
  missionId: string;
  sequence: number;
  latitude: number;
  longitude: number;
  altitude: number;
  action: 'SCAN' | 'HOVER' | 'THERMAL_SWEEP' | 'WAYPOINT';
  status: 'PENDING' | 'REACHED' | 'ACTIVE';
}

export interface Mission {
  missionId: string;
  missionName?: string;
  name?: string;
  disasterType: DisasterType;
  status: MissionStatus;
  priority: MissionPriority;
  assignedDroneIds: string[];
  searchPattern: SearchPattern;
  targetZone?: string;
  altitudeMeters?: number;
  speedMps?: number;
  startTime?: string;
  startedAt?: string;
  endTime?: string;
  completedAt?: string | null;
  searchArea?: SearchAreaPoint[];
  areaCoveredKm2: number;
  targetAreaKm2?: number;
  totalAreaKm2?: number;
  altitudeTarget?: number;
  maxDurationMinutes?: number;
  estimatedDurationMinutes?: number;
  waypointCount?: number;
}

export type SurvivorPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RescueStatus = 'Detected' | 'Verified' | 'Rescue Assigned' | 'Rescued' | 'Monitoring';

export interface Survivor {
  survivorId: string;
  detectionId: string;
  droneId: string;
  missionId: string;
  latitude: number;
  longitude: number;
  confidence: number; // 0-100
  priorityScore: number; // 0-100 AI calculated
  priorityLevel: SurvivorPriority;
  manualOverride?: {
    overriddenBy: string;
    overriddenAt: string;
    originalPriority: SurvivorPriority;
    notes: string;
  };
  peopleCount: number;
  nearbyHazards: string[];
  rescueStatus: RescueStatus;
  detectedAt: string;
  imageUrl: string;
  thermalImageUrl: string;
  notes?: string;
}

export type HazardType = 
  | 'Fire' 
  | 'Smoke' 
  | 'Flood' 
  | 'Damaged structure' 
  | 'Unstable building' 
  | 'Debris' 
  | 'Landslide' 
  | 'Electrical line' 
  | 'Chemical hazard';

export type HazardSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type VerificationStatus = 'AI Detected' | 'Human Verified' | 'False Positive' | 'Resolved';

export interface Hazard {
  hazardId: string;
  detectionId: string;
  droneId: string;
  missionId: string;
  hazardType: HazardType;
  severity: HazardSeverity;
  confidence: number; // 0-100
  latitude: number;
  longitude: number;
  status: VerificationStatus;
  recommendedResponse: string;
  imageUrl: string;
  detectedAt: string;
  radiusMeters: number;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WARNING' | 'INFO';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'RESOLVED';

export interface Alert {
  alertId: string;
  detectionId?: string;
  alertType?: 'SURVIVOR_CRITICAL' | 'FIRE_HAZARD' | 'ELECTRICAL_LINE' | 'FLOOD_SURGE' | 'STRUCTURAL_COLLAPSE' | 'DRONE_BATTERY' | string;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
  latitude: number;
  longitude: number;
  droneId: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type EmergencyAlert = Alert;

export interface Detection {
  detectionId: string;
  droneId: string;
  missionId: string;
  category: 'People' | 'Hazards';
  detectionType: string;
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  latitude: number;
  longitude: number;
  imageUrl: string;
  thermalImageUrl?: string;
  timestamp: string;
  verificationStatus: VerificationStatus;
  boundingBox?: {
    x: number; // 0-100%
    y: number;
    w: number;
    h: number;
    label: string;
  };
}

export interface MissionReport {
  reportId: string;
  missionId: string;
  reportName: string;
  generatedBy: string;
  generatedAt: string;
  summary: {
    disasterType: string;
    surveyedAreaKm2: number;
    activeDronesCount: number;
    survivorsDetected: number;
    criticalSurvivors: number;
    hazardsDetected: number;
    criticalAlertsCount: number;
    searchCoveragePct: number;
  };
  aiRecommendations: string[];
  actionItems: string[];
}

export type ConnectivityStatus = 'ONLINE' | 'LIMITED' | 'OFFLINE';
