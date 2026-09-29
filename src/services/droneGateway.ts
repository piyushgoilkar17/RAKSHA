import { commandStore } from './store';
import { Drone, Detection, Alert } from '../types';

export interface TelemetryPayload {
  droneId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  battery: number;
  signalStrength: number;
  gpsStatus: 'LOCKED' | 'RTK_FIX' | 'DEGRADED' | 'DENIED';
  imuStatus: 'CALIBRATED' | 'ALIGNING' | 'ERROR';
  navMode: Drone['navMode'];
}

export interface DetectionPayload {
  droneId: string;
  missionId: string;
  category: 'People' | 'Hazards';
  detectionType: string;
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  latitude: number;
  longitude: number;
  imageBlobUrl?: string;
  thermalBlobUrl?: string;
  boundingBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
  };
}

export interface DroneCommandPayload {
  commandId: string;
  droneId: string;
  action: 'RTH' | 'HOLD' | 'RESUME' | 'EMERGENCY_LAND' | 'WAYPOINT_GOTO' | 'THERMAL_SWEEP';
  params?: Record<string, any>;
  issuedAt: string;
  issuedBy: string;
}

export class DroneGatewayService {
  public static protocol: 'EDGE_GATEWAY_MOCK_SIMULATOR' | 'MQTT_BROKER' | 'REST_UPLINK' = 'EDGE_GATEWAY_MOCK_SIMULATOR';

  /**
   * Called by edge drone computing unit to stream current telemetry
   */
  public static async sendTelemetry(payload: TelemetryPayload): Promise<{ success: boolean; latencyMs: number }> {
    const start = performance.now();
    commandStore.updateDroneTelemetry(payload.droneId, {
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude,
      speed: payload.speed,
      heading: payload.heading,
      battery: payload.battery,
      signalStrength: payload.signalStrength,
      gpsStatus: payload.gpsStatus,
      imuStatus: payload.imuStatus,
      navMode: payload.navMode,
      lastSeen: 'Just now',
    });
    return { success: true, latencyMs: Math.round(performance.now() - start) };
  }

  /**
   * Called by edge YOLO / MobileNet / Coral TPU models when object is detected
   */
  public static async submitDetection(payload: DetectionPayload): Promise<{ detectionId: string; status: string }> {
    commandStore.addDetection({
      droneId: payload.droneId,
      missionId: payload.missionId,
      category: payload.category,
      detectionType: payload.detectionType,
      confidence: payload.confidence,
      severity: payload.severity,
      latitude: payload.latitude,
      longitude: payload.longitude,
      imageUrl: payload.imageBlobUrl || '',
      thermalImageUrl: payload.thermalBlobUrl,
      verificationStatus: 'AI Detected',
      boundingBox: payload.boundingBox,
    });
    return { detectionId: `DET-${Date.now().toString().slice(-4)}`, status: 'PROCESSED_BY_AI_PIPELINE' };
  }

  /**
   * Called by onboard FLIR radiometric camera to transmit thermal hotspots
   */
  public static async submitThermalDetection(payload: DetectionPayload): Promise<{ status: string }> {
    return this.submitDetection({
      ...payload,
      category: 'People',
      detectionType: 'FLIR Thermal Heat Signature',
    });
  }

  public static async updateDroneStatus(droneId: string, status: Drone['status']): Promise<void> {
    commandStore.setDroneStatus(droneId, status);
  }

  public static async updateMissionStatus(missionId: string, status: any): Promise<void> {
    commandStore.updateMissionStatus(missionId, status);
  }

  public static async receiveDroneCommand(cmd: DroneCommandPayload): Promise<{ acknowledged: boolean; timestamp: string }> {
    if (cmd.action === 'RTH') {
      commandStore.setDroneStatus(cmd.droneId, 'RETURNING');
      commandStore.setDroneNavMode(cmd.droneId, 'RETURN_TO_HOME');
    } else if (cmd.action === 'HOLD') {
      commandStore.setDroneStatus(cmd.droneId, 'STANDBY');
    } else if (cmd.action === 'RESUME') {
      commandStore.setDroneStatus(cmd.droneId, 'ACTIVE');
      commandStore.setDroneNavMode(cmd.droneId, 'GPS_MODE');
    } else if (cmd.action === 'EMERGENCY_LAND') {
      commandStore.setDroneStatus(cmd.droneId, 'EMERGENCY');
    }
    return { acknowledged: true, timestamp: new Date().toISOString() };
  }

  public static async sendAlert(alertData: Omit<Alert, 'alertId' | 'createdAt' | 'status'>): Promise<void> {
    commandStore.addAlert(alertData);
  }

  public static async uploadDetectionImage(dataUrlOrBlob: string): Promise<string> {
    // In production, uploads to Firebase Storage / Cloud Storage bucket
    return dataUrlOrBlob;
  }

  public static async pushTelemetry(droneId: string, updates: Partial<Drone>): Promise<void> {
    commandStore.updateDroneTelemetry(droneId, updates);
  }
}

export const droneGateway = DroneGatewayService;
