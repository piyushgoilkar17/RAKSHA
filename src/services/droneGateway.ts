import { commandStore } from './store';
import { Raksha, Detection, Alert } from '../types';

export interface TelemetryPayload {
  rakshaId: string;
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
  navMode: Raksha['navMode'];
}

export interface DetectionPayload {
  rakshaId: string;
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

export interface RakshaCommandPayload {
  commandId: string;
  rakshaId: string;
  action: 'RTH' | 'HOLD' | 'RESUME' | 'EMERGENCY_LAND' | 'WAYPOINT_GOTO' | 'THERMAL_SWEEP';
  params?: Record<string, any>;
  issuedAt: string;
  issuedBy: string;
}

export class RakshaGatewayService {
  public static protocol: 'EDGE_GATEWAY_MOCK_SIMULATOR' | 'MQTT_BROKER' | 'REST_UPLINK' = 'EDGE_GATEWAY_MOCK_SIMULATOR';

  /**
   * Called by edge raksha computing unit to stream current telemetry
   */
  public static async sendTelemetry(payload: TelemetryPayload): Promise<{ success: boolean; latencyMs: number }> {
    const start = performance.now();
    commandStore.updateRakshaTelemetry(payload.rakshaId, {
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
      rakshaId: payload.rakshaId,
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

  public static async updateRakshaStatus(rakshaId: string, status: Raksha['status']): Promise<void> {
    commandStore.setRakshaStatus(rakshaId, status);
  }

  public static async updateMissionStatus(missionId: string, status: any): Promise<void> {
    commandStore.updateMissionStatus(missionId, status);
  }

  public static async receiveRakshaCommand(cmd: RakshaCommandPayload): Promise<{ acknowledged: boolean; timestamp: string }> {
    if (cmd.action === 'RTH') {
      commandStore.setRakshaStatus(cmd.rakshaId, 'RETURNING');
      commandStore.setRakshaNavMode(cmd.rakshaId, 'RETURN_TO_HOME');
    } else if (cmd.action === 'HOLD') {
      commandStore.setRakshaStatus(cmd.rakshaId, 'STANDBY');
    } else if (cmd.action === 'RESUME') {
      commandStore.setRakshaStatus(cmd.rakshaId, 'ACTIVE');
      commandStore.setRakshaNavMode(cmd.rakshaId, 'GPS_MODE');
    } else if (cmd.action === 'EMERGENCY_LAND') {
      commandStore.setRakshaStatus(cmd.rakshaId, 'EMERGENCY');
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

  public static async pushTelemetry(rakshaId: string, updates: Partial<Raksha>): Promise<void> {
    commandStore.updateRakshaTelemetry(rakshaId, updates);
  }
}

export const rakshaGateway = RakshaGatewayService;
