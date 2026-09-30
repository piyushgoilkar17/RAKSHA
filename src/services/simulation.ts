import { commandStore } from './store';
import { createSvgImageDataUrl } from './seedData';

// Simulated flight waypoints for the 3 rakshas around Venice disaster zone
const rakshaFlightLoops: Record<string, Array<{ lat: number; lng: number; alt: number }>> = {
  'RAKSHA-01': [
    { lat: 45.4405, lng: 12.3265, alt: 82 },
    { lat: 45.4440, lng: 12.3300, alt: 80 },
    { lat: 45.4475, lng: 12.3270, alt: 78 },
    { lat: 45.4450, lng: 12.3220, alt: 85 },
    { lat: 45.4410, lng: 12.3200, alt: 84 },
  ],
  'RAKSHA-02': [
    { lat: 45.4262, lng: 12.3411, alt: 95 },
    { lat: 45.4300, lng: 12.3460, alt: 92 },
    { lat: 45.4270, lng: 12.3500, alt: 90 },
    { lat: 45.4230, lng: 12.3470, alt: 96 },
    { lat: 45.4220, lng: 12.3390, alt: 94 },
  ],
  'RAKSHA-03': [
    { lat: 45.4490, lng: 12.3130, alt: 68 },
    { lat: 45.4530, lng: 12.3170, alt: 70 },
    { lat: 45.4560, lng: 12.3120, alt: 72 },
    { lat: 45.4520, lng: 12.3070, alt: 69 },
    { lat: 45.4480, lng: 12.3090, alt: 67 },
  ],
};

const rakshaPathIndices: Record<string, { current: number; progress: number }> = {
  'RAKSHA-01': { current: 0, progress: 0 },
  'RAKSHA-02': { current: 0, progress: 0.3 },
  'RAKSHA-03': { current: 0, progress: 0.7 },
};

let simInterval: any = null;
let detectionCounter = 0;

export function startSimulationEngine() {
  if (simInterval) clearInterval(simInterval);

  simInterval = setInterval(() => {
    if (!commandStore.isSimulating) return;

    const speedMultiplier = commandStore.simulationSpeed;
    const step = 0.04 * speedMultiplier;

    commandStore.rakshas.forEach((raksha) => {
      if (raksha.status !== 'ACTIVE' && raksha.status !== 'RETURNING') return;

      const loop = rakshaFlightLoops[raksha.rakshaId];
      if (!loop) return;

      const pathState = rakshaPathIndices[raksha.rakshaId];
      pathState.progress += step;

      if (pathState.progress >= 1) {
        pathState.progress = 0;
        pathState.current = (pathState.current + 1) % loop.length;
      }

      const p1 = loop[pathState.current];
      const p2 = loop[(pathState.current + 1) % loop.length];

      // Linear interpolation between waypoints
      const newLat = p1.lat + (p2.lat - p1.lat) * pathState.progress;
      const newLng = p1.lng + (p2.lng - p1.lng) * pathState.progress;
      const newAlt = Math.round(p1.alt + (p2.alt - p1.alt) * pathState.progress + (Math.random() - 0.5) * 2);

      // Calculate bearing / heading
      const y = Math.sin((p2.lng - p1.lng) * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180));
      const x =
        Math.cos(p1.lat * (Math.PI / 180)) * Math.sin(p2.lat * (Math.PI / 180)) -
        Math.sin(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) * Math.cos((p2.lng - p1.lng) * (Math.PI / 180));
      let heading = Math.round((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

      // Drain battery slightly
      const newBattery = Math.max(5, +(raksha.battery - 0.02 * speedMultiplier).toFixed(2));
      const newDistance = +(raksha.distanceTravelledKm + 0.015 * speedMultiplier).toFixed(2);
      const newFlightTime = Math.round(raksha.flightTimeMinutes + (0.1 * speedMultiplier));
      const currentSpeed = +(7.5 + Math.sin(Date.now() / 3000) * 1.5).toFixed(1);

      commandStore.updateRakshaTelemetry(raksha.rakshaId, {
        latitude: +newLat.toFixed(6),
        longitude: +newLng.toFixed(6),
        altitude: newAlt,
        heading,
        speed: currentSpeed,
        battery: newBattery,
        distanceTravelledKm: newDistance,
        flightTimeMinutes: newFlightTime,
        lastSeen: 'Just now',
      });
    });

    // Periodically spawn simulated edge AI detections (every ~40 seconds of real-time at 1x)
    detectionCounter += 1 * speedMultiplier;
    if (detectionCounter >= 40) {
      detectionCounter = 0;
      triggerSimulatedEdgeDetection();
    }
  }, 1000);
}

export function stopSimulationEngine() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
}

function triggerSimulatedEdgeDetection() {
  const isSurvivor = Math.random() > 0.45;
  const rakshas = commandStore.rakshas.filter((d) => d.status === 'ACTIVE');
  if (rakshas.length === 0) return;

  const randomRaksha = rakshas[Math.floor(Math.random() * rakshas.length)];
  const latOffset = (Math.random() - 0.5) * 0.006;
  const lngOffset = (Math.random() - 0.5) * 0.006;
  const targetLat = +(randomRaksha.latitude + latOffset).toFixed(5);
  const targetLng = +(randomRaksha.longitude + lngOffset).toFixed(5);

  if (isSurvivor) {
    const confidence = Math.round(82 + Math.random() * 16);
    const peopleCount = Math.floor(1 + Math.random() * 4);
    commandStore.addDetection({
      rakshaId: randomRaksha.rakshaId,
      missionId: randomRaksha.currentMissionId,
      category: 'People',
      detectionType: peopleCount > 1 ? `Survivor Group (x${peopleCount})` : 'Individual Survivor',
      confidence,
      severity: confidence > 90 ? 'CRITICAL' : 'HIGH',
      latitude: targetLat,
      longitude: targetLng,
      imageUrl: createSvgImageDataUrl('survivor'),
      thermalImageUrl: createSvgImageDataUrl('thermal_person'),
      verificationStatus: 'AI Detected',
      boundingBox: {
        x: Math.round(25 + Math.random() * 40),
        y: Math.round(25 + Math.random() * 40),
        w: 30,
        h: 35,
        label: `SURVIVOR x${peopleCount} (${confidence}%)`,
      },
    });
  } else {
    const hazardTypes = ['Floodwater Surge', 'Damaged Structure', 'Exposed Electrical Line', 'Active Fire', 'Debris Field'];
    const chosenType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
    const confidence = Math.round(80 + Math.random() * 18);
    const severity = chosenType.includes('Electrical') || chosenType.includes('Fire') ? 'CRITICAL' : 'HIGH';

    commandStore.addDetection({
      rakshaId: randomRaksha.rakshaId,
      missionId: randomRaksha.currentMissionId,
      category: 'Hazards',
      detectionType: chosenType,
      confidence,
      severity,
      latitude: targetLat,
      longitude: targetLng,
      imageUrl: chosenType.includes('Fire')
        ? createSvgImageDataUrl('fire')
        : chosenType.includes('Flood')
        ? createSvgImageDataUrl('flood')
        : chosenType.includes('Electrical')
        ? createSvgImageDataUrl('electrical')
        : createSvgImageDataUrl('damage'),
      verificationStatus: 'AI Detected',
      boundingBox: {
        x: 30,
        y: 35,
        w: 45,
        h: 40,
        label: `${chosenType.toUpperCase()} (${confidence}%)`,
      },
    });
  }
}
