import { 
  Raksha, Mission, Survivor, Hazard, Alert, Detection, Waypoint, 
  UserProfile, UserRole, ConnectivityStatus, MissionReport,
  SurvivorPriority, RescueStatus, VerificationStatus, AlertStatus, RakshaStatus
} from '../types';
import { 
  initialUsers, initialMissions, initialRakshas, 
  initialSurvivors, initialHazards, initialAlerts, 
  initialWaypoints, initialDetections, removedDemoDetectionIds 
} from './seedData';

type Listener = () => void;

class CommandStore {
  private listeners: Set<Listener> = new Set();

  public currentUser: UserProfile = initialUsers[0]; // Default: Mission Commander
  public connectivity: ConnectivityStatus = 'ONLINE';
  public isSimulating: boolean = true;
  public simulationSpeed: number = 1; // 1x, 2x, 5x
  public offlineQueue: Array<{ action: string; payload: any; timestamp: string }> = [];

  public missions: Mission[] = [...initialMissions];
  public rakshas: Raksha[] = [...initialRakshas];
  public survivors: Survivor[] = [...initialSurvivors];
  public hazards: Hazard[] = [...initialHazards];
  public alerts: Alert[] = [...initialAlerts];
  public detections: Detection[] = [...initialDetections];
  public waypoints: Waypoint[] = [...initialWaypoints];
  public reports: MissionReport[] = [
    {
      reportId: 'REP-2026-09A-01',
      missionId: 'MSN-2026-09A',
      reportName: 'SITREP #1 — Adyar/Velachery Sector Inundation Assessment',
      generatedBy: 'Cmdr. Sushmitha R.',
      generatedAt: '2026-09-06T22:30:00Z',
      summary: {
        disasterType: 'Flood + Structural Damage',
        surveyedAreaKm2: 12.6,
        activeRakshasCount: 3,
        survivorsDetected: 27,
        criticalSurvivors: 8,
        hazardsDetected: 14,
        criticalAlertsCount: 5,
        searchCoveragePct: 70,
      },
      aiRecommendations: [
        'Prioritize aerial hoist rescue for S-014 roof party before nighttime darkness.',
        'Coordinate with TANGEDCO to de-energize 11kV line near Saidapet bridge.',
        'Reroute SDRF watercraft around submerged vehicle field at Velachery road intersection.',
      ],
      actionItems: [
        'Dispatch Boat Unit 03 to Sector A (Waypoint 3)',
        'Maintain RAKSHA-03 FLIR thermal sweep across Saidapet residential pockets',
        'Request helicopter winch team for rooftop extrications',
      ],
    },
  ];

  constructor() {
    this.loadFromStorage();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  private saveToStorage() {
    try {
      const state = {
        missions: this.missions,
        rakshas: this.rakshas,
        survivors: this.survivors,
        hazards: this.hazards,
        alerts: this.alerts,
        detections: this.detections,
        waypoints: this.waypoints,
        reports: this.reports,
        connectivity: this.connectivity,
        currentUser: this.currentUser,
      };
      localStorage.setItem('raksha_state_v1', JSON.stringify(state));
    } catch {
      // ignore storage write errors in private browsing/sandbox
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem('raksha_state_v1');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.rakshas && parsed.missions) {
          this.missions = parsed.missions;
          this.rakshas = parsed.rakshas;
          this.survivors = parsed.survivors || this.survivors;
          this.hazards = parsed.hazards || this.hazards;
          this.alerts = parsed.alerts || this.alerts;
          this.detections = (parsed.detections || this.detections).filter(
            (detection: Detection) => !removedDemoDetectionIds.has(detection.detectionId)
          );
          this.waypoints = parsed.waypoints || this.waypoints;
          this.reports = parsed.reports || this.reports;
          if (parsed.connectivity) this.connectivity = parsed.connectivity;
          if (parsed.currentUser) this.currentUser = parsed.currentUser;
        }
      }
    } catch {
      // fallback to initial seed
    }
  }

  public resetToSeed() {
    this.missions = JSON.parse(JSON.stringify(initialMissions));
    this.rakshas = JSON.parse(JSON.stringify(initialRakshas));
    this.survivors = JSON.parse(JSON.stringify(initialSurvivors));
    this.hazards = JSON.parse(JSON.stringify(initialHazards));
    this.alerts = JSON.parse(JSON.stringify(initialAlerts));
    this.detections = JSON.parse(JSON.stringify(initialDetections));
    this.waypoints = JSON.parse(JSON.stringify(initialWaypoints));
    this.connectivity = 'ONLINE';
    this.isSimulating = true;
    this.offlineQueue = [];
    this.notify();
  }

  public setUserRole(role: UserRole) {
    const found = initialUsers.find((u) => u.role === role);
    if (found) {
      this.currentUser = { ...found };
      this.notify();
    }
  }

  public setConnectivity(status: ConnectivityStatus) {
    this.connectivity = status;
    if (status === 'ONLINE' && this.offlineQueue.length > 0) {
      // Sync flushed offline actions
      this.offlineQueue = [];
    }
    this.notify();
  }

  public toggleSimulation() {
    this.isSimulating = !this.isSimulating;
    this.notify();
  }

  public setSimulationSpeed(speed: number) {
    this.simulationSpeed = speed;
    this.notify();
  }

  // --- Raksha Operations ---
  public updateRakshaTelemetry(rakshaId: string, partial: Partial<Raksha>) {
    this.rakshas = this.rakshas.map((d) => (d.rakshaId === rakshaId ? { ...d, ...partial } : d));
    this.notify();
  }

  public setRakshaStatus(rakshaId: string, status: RakshaStatus) {
    this.checkOffline('SET_RAKSHA_STATUS', { rakshaId, status });
    this.rakshas = this.rakshas.map((d) => (d.rakshaId === rakshaId ? { ...d, status } : d));
    this.notify();
  }

  public setRakshaNavMode(rakshaId: string, navMode: Raksha['navMode']) {
    this.checkOffline('SET_NAV_MODE', { rakshaId, navMode });
    this.rakshas = this.rakshas.map((d) => (d.rakshaId === rakshaId ? { ...d, navMode } : d));
    this.notify();
  }

  public assignRakshaMission(rakshaId: string, missionId: string) {
    this.checkOffline('ASSIGN_RAKSHA_MISSION', { rakshaId, missionId });
    this.rakshas = this.rakshas.map((d) => (d.rakshaId === rakshaId ? { ...d, currentMissionId: missionId } : d));
    this.notify();
  }

  // --- Survivor Operations & Human-in-the-Loop Prioritization ---
  public updateSurvivorStatus(survivorId: string, rescueStatus: RescueStatus) {
    this.checkOffline('UPDATE_SURVIVOR_STATUS', { survivorId, rescueStatus });
    this.survivors = this.survivors.map((s) => (s.survivorId === survivorId ? { ...s, rescueStatus } : s));
    this.notify();
  }

  public overrideSurvivorPriority(survivorId: string, newPriority: SurvivorPriority, notes: string) {
    this.checkOffline('OVERRIDE_PRIORITY', { survivorId, newPriority, notes });
    this.survivors = this.survivors.map((s) => {
      if (s.survivorId === survivorId) {
        return {
          ...s,
          priorityLevel: newPriority,
          manualOverride: {
            overriddenBy: `${this.currentUser.name} (${this.currentUser.callsign})`,
            overriddenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            originalPriority: s.priorityLevel,
            notes,
          },
        };
      }
      return s;
    });
    this.notify();
  }

  // --- Hazard Operations ---
  public updateHazardStatus(hazardId: string, status: VerificationStatus) {
    this.checkOffline('UPDATE_HAZARD_STATUS', { hazardId, status });
    this.hazards = this.hazards.map((h) => (h.hazardId === hazardId ? { ...h, status } : h));
    this.notify();
  }

  // --- Alert Operations ---
  public updateAlertStatus(alertId: string, status: AlertStatus) {
    this.checkOffline('UPDATE_ALERT_STATUS', { alertId, status });
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.alerts = this.alerts.map((a) => {
      if (a.alertId === alertId) {
        return {
          ...a,
          status,
          ...(status === 'ACKNOWLEDGED' ? { acknowledgedAt: now, acknowledgedBy: this.currentUser.name } : {}),
          ...(status === 'RESOLVED' ? { resolvedAt: now, resolvedBy: this.currentUser.name } : {}),
        };
      }
      return a;
    });
    this.notify();
  }

  public addAlert(alert: Omit<Alert, 'alertId' | 'createdAt' | 'status'>) {
    const newAlert: Alert = {
      ...alert,
      alertId: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: 'Just now',
      status: 'NEW',
    };
    this.alerts = [newAlert, ...this.alerts];
    this.notify();
  }

  // --- Detections ---
  public addDetection(detection: Omit<Detection, 'detectionId' | 'timestamp'>) {
    const newDet: Detection = {
      ...detection,
      detectionId: `DET-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
    };
    this.detections = [newDet, ...this.detections];

    // Cloud function-equivalent logic:
    if (detection.category === 'People') {
      const score = Math.min(100, Math.round(detection.confidence * 0.4 + (detection.severity === 'CRITICAL' ? 40 : 20) + 15));
      const prioLevel: SurvivorPriority = score >= 80 ? 'CRITICAL' : score >= 65 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';
      
      const newSurvivor: Survivor = {
        survivorId: `S-${Math.floor(100 + Math.random() * 900)}`,
        detectionId: newDet.detectionId,
        rakshaId: detection.rakshaId,
        missionId: detection.missionId,
        latitude: detection.latitude,
        longitude: detection.longitude,
        confidence: detection.confidence,
        priorityScore: score,
        priorityLevel: prioLevel,
        peopleCount: 1,
        nearbyHazards: ['Floodwater current', 'Debris'],
        rescueStatus: 'Detected',
        detectedAt: 'Just now',
        imageUrl: detection.imageUrl,
        thermalImageUrl: detection.thermalImageUrl || detection.imageUrl,
        notes: `AI edge detection from ${detection.rakshaId}`,
      };
      this.survivors = [newSurvivor, ...this.survivors];

      if (prioLevel === 'CRITICAL') {
        this.addAlert({
          detectionId: newDet.detectionId,
          alertType: 'SURVIVOR_CRITICAL',
          severity: 'CRITICAL',
          message: `Critical survivor detected at lat ${detection.latitude.toFixed(4)}, lon ${detection.longitude.toFixed(4)}. Priority Score: ${score}/100.`,
          recommendation: 'Immediate rescue team dispatch. Check nearby hazards.',
          latitude: detection.latitude,
          longitude: detection.longitude,
          rakshaId: detection.rakshaId,
        });
      }
    } else {
      const newHazard: Hazard = {
        hazardId: `HAZ-${Math.floor(100 + Math.random() * 900)}`,
        detectionId: newDet.detectionId,
        rakshaId: detection.rakshaId,
        missionId: detection.missionId,
        hazardType: (detection.detectionType as any) || 'Flood',
        severity: detection.severity,
        confidence: detection.confidence,
        latitude: detection.latitude,
        longitude: detection.longitude,
        status: 'AI Detected',
        recommendedResponse: 'Cordon off perimeter and notify disaster response unit.',
        imageUrl: detection.imageUrl,
        detectedAt: 'Just now',
        radiusMeters: 50,
      };
      this.hazards = [newHazard, ...this.hazards];

      if (detection.severity === 'CRITICAL') {
        this.addAlert({
          detectionId: newDet.detectionId,
          alertType: 'FIRE_HAZARD',
          severity: 'CRITICAL',
          message: `Critical hazard (${detection.detectionType}) spotted by ${detection.rakshaId}.`,
          recommendation: 'Verify immediately and reroute nearby rescue operations.',
          latitude: detection.latitude,
          longitude: detection.longitude,
          rakshaId: detection.rakshaId,
        });
      }
    }
    this.notify();
  }

  // --- Missions ---
  public createMission(missionData: Omit<Mission, 'missionId' | 'areaCoveredKm2'>) {
    this.checkOffline('CREATE_MISSION', missionData);
    const newMission: Mission = {
      ...missionData,
      missionId: `MSN-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}X`,
      areaCoveredKm2: 0,
    };
    this.missions = [newMission, ...this.missions];
    this.notify();
  }

  public updateMissionStatus(missionId: string, status: Mission['status']) {
    this.checkOffline('UPDATE_MISSION_STATUS', { missionId, status });
    this.missions = this.missions.map((m) => (m.missionId === missionId ? { ...m, status } : m));
    this.notify();
  }

  // --- Reports ---
  public addReport(report: MissionReport) {
    this.reports = [report, ...this.reports];
    this.notify();
  }

  private checkOffline(action: string, payload: any) {
    if (this.connectivity === 'OFFLINE' || this.connectivity === 'LIMITED') {
      this.offlineQueue.push({
        action,
        payload,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const commandStore = new CommandStore();
