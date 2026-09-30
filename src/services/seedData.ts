import { Raksha, Mission, Survivor, Hazard, Alert, Detection, Waypoint, UserProfile } from '../types';

// Helper to generate SVG placeholder data URLs for realistic aerial disaster and FLIR thermal imagery
export function createSvgImageDataUrl(type: 'survivor' | 'thermal_person' | 'flood' | 'fire' | 'damage' | 'electrical' | 'debris'): string {
  let svgContent = '';
  if (type === 'survivor') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g1)"/>
      <path d="M 0 180 Q 150 160 400 190 L 400 300 L 0 300 Z" fill="#1e3a5f" opacity="0.7"/>
      <!-- Rooftop -->
      <polygon points="120,170 280,170 320,230 80,230" fill="#475569"/>
      <polygon points="120,170 200,110 280,170" fill="#334155"/>
      <!-- People on roof waving -->
      <circle cx="180" cy="140" r="8" fill="#facc15"/>
      <line x1="180" y1="148" x2="180" y2="165" stroke="#facc15" stroke-width="3"/>
      <line x1="170" y1="145" x2="190" y2="145" stroke="#facc15" stroke-width="3"/>
      <circle cx="210" cy="142" r="8" fill="#f87171"/>
      <line x1="210" y1="150" x2="210" y2="165" stroke="#f87171" stroke-width="3"/>
      <!-- AI Bounding Box -->
      <rect x="160" y="125" width="70" height="55" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="4,2"/>
      <rect x="160" y="110" width="70" height="15" fill="#22c55e"/>
      <text x="163" y="121" fill="#000" font-family="monospace" font-size="10" font-weight="bold">SURVIVOR 96%</text>
      <!-- HUD metadata -->
      <text x="10" y="25" fill="#38bdf8" font-family="monospace" font-size="11">CAM-01 RGB 4K | VENICE_FLOOD_SEC_4</text>
      <text x="10" y="285" fill="#94a3b8" font-family="monospace" font-size="10">LAT: 45.4325° N | LON: 12.3332° E | ALT: 65m</text>
    </svg>`;
  } else if (type === 'thermal_person') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="flir" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#18003a"/>
          <stop offset="40%" stop-color="#56006e"/>
          <stop offset="70%" stop-color="#b8273b"/>
          <stop offset="90%" stop-color="#ea7300"/>
          <stop offset="100%" stop-color="#fdf498"/>
        </linearGradient>
        <radialGradient id="heat1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#ffea00"/>
          <stop offset="60%" stop-color="#ff3300"/>
          <stop offset="100%" stop-color="#660066" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="#0a0520"/>
      <!-- Thermal structure backdrop -->
      <path d="M 50 220 L 200 120 L 350 220 Z" fill="#2d1445"/>
      <!-- Thermal human heat signatures (37.2°C) -->
      <ellipse cx="185" cy="155" rx="14" ry="24" fill="url(#heat1)"/>
      <ellipse cx="215" cy="158" rx="12" ry="22" fill="url(#heat1)"/>
      <!-- Cold floodwater below (18.5°C) -->
      <rect y="230" width="400" height="70" fill="#050014"/>
      <!-- Crosshairs & FLIR palette scale -->
      <line x1="200" y1="130" x2="200" y2="180" stroke="#00ffff" stroke-width="1" stroke-dasharray="2,2"/>
      <line x1="170" y1="155" x2="230" y2="155" stroke="#00ffff" stroke-width="1" stroke-dasharray="2,2"/>
      <!-- Scale -->
      <rect x="370" y="30" width="12" height="240" fill="url(#flir)"/>
      <text x="340" y="42" fill="#fff" font-family="monospace" font-size="9">38.4°C</text>
      <text x="340" y="265" fill="#fff" font-family="monospace" font-size="9">18.0°C</text>
      <text x="10" y="25" fill="#facc15" font-family="monospace" font-size="11">FLIR LWIR 640x512 | SPOT: 37.1°C</text>
      <text x="10" y="285" fill="#38bdf8" font-family="monospace" font-size="10">ISOTHERM ON • 2 HEAT SIGNATURES DETECTED</text>
    </svg>`;
  } else if (type === 'fire') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#1c1917"/>
      <circle cx="200" cy="160" r="70" fill="#f97316" opacity="0.8"/>
      <circle cx="200" cy="150" r="45" fill="#ef4444" opacity="0.9"/>
      <circle cx="200" cy="140" r="25" fill="#fbbf24"/>
      <!-- Smoke plumes -->
      <path d="M 170 120 Q 150 60 180 20 Q 210 50 190 100 Z" fill="#78716c" opacity="0.6"/>
      <path d="M 210 110 Q 240 50 220 15 Q 190 40 210 90 Z" fill="#a8a29e" opacity="0.5"/>
      <rect x="140" y="90" width="120" height="110" fill="none" stroke="#ef4444" stroke-width="2"/>
      <rect x="140" y="72" width="90" height="18" fill="#ef4444"/>
      <text x="145" y="85" fill="#fff" font-family="monospace" font-size="10" font-weight="bold">FIRE HAZARD 98%</text>
      <text x="10" y="285" fill="#f87171" font-family="monospace" font-size="10">THERMAL PEAK: 420°C | SPREAD RISK: HIGH</text>
    </svg>`;
  } else if (type === 'flood') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#0f172a"/>
      <path d="M 0 100 Q 180 140 400 90 L 400 300 L 0 300 Z" fill="#0284c7" opacity="0.75"/>
      <!-- Submerged cars and poles -->
      <rect x="130" y="160" width="45" height="20" rx="4" fill="#64748b"/>
      <rect x="250" y="190" width="40" height="18" rx="4" fill="#475569"/>
      <line x1="90" y1="120" x2="90" y2="180" stroke="#facc15" stroke-width="3"/>
      <rect x="70" y="110" width="280" height="140" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,2"/>
      <rect x="70" y="92" width="130" height="18" fill="#0284c7"/>
      <text x="75" y="105" fill="#fff" font-family="monospace" font-size="10" font-weight="bold">FLOODWATER SURGE 94%</text>
      <text x="10" y="285" fill="#7dd3fc" font-family="monospace" font-size="10">DEPTH EST: 2.1m | FLOW VELOCITY: 1.8 m/s</text>
    </svg>`;
  } else if (type === 'damage') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#18181b"/>
      <polygon points="60,260 140,80 230,120 290,260" fill="#52525b"/>
      <!-- Structural fissure crack -->
      <path d="M 160 90 L 175 140 L 160 180 L 185 240" stroke="#f97316" stroke-width="4" fill="none"/>
      <rect x="100" y="70" width="160" height="180" fill="none" stroke="#f97316" stroke-width="2"/>
      <rect x="100" y="52" width="150" height="18" fill="#f97316"/>
      <text x="105" y="65" fill="#000" font-family="monospace" font-size="10" font-weight="bold">UNSTABLE STRUCTURE 91%</text>
      <text x="10" y="285" fill="#fdba74" font-family="monospace" font-size="10">COLLAPSE RISK: IMMINENT | REBAR EXPOSED</text>
    </svg>`;
  } else if (type === 'electrical') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#090d16"/>
      <line x1="20" y1="120" x2="380" y2="240" stroke="#facc15" stroke-width="3"/>
      <!-- Electric spark arc -->
      <polygon points="190,175 205,160 200,185 215,170 195,200" fill="#38bdf8"/>
      <rect x="150" y="130" width="100" height="85" fill="none" stroke="#eab308" stroke-width="2"/>
      <rect x="150" y="112" width="140" height="18" fill="#eab308"/>
      <text x="155" y="125" fill="#000" font-family="monospace" font-size="10" font-weight="bold">ELECTRICAL HAZARD 95%</text>
      <text x="10" y="285" fill="#fde047" font-family="monospace" font-size="10">11kV LIVE CONDUCTOR SUBMERGED IN WATER</text>
    </svg>`;
  } else {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#1e1b4b"/>
      <polygon points="120,240 180,180 260,220 310,250 80,250" fill="#4338ca"/>
      <rect x="90" y="150" width="220" height="110" fill="none" stroke="#a855f7" stroke-width="2"/>
      <rect x="90" y="132" width="110" height="18" fill="#a855f7"/>
      <text x="95" y="145" fill="#fff" font-family="monospace" font-size="10" font-weight="bold">DEBRIS ACCUMULATION</text>
      <text x="10" y="285" fill="#c084fc" font-family="monospace" font-size="10">IMPASSABLE ROUTE | HEAVY SEDIMENT</text>
    </svg>`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

export const initialUsers: UserProfile[] = [
  {
    uid: 'u_cmd_01',
    name: 'Cmdr. Sushmitha R.',
    email: 'sushmithadhandapani85@gmail.com',
    role: 'MISSION_COMMANDER',
    callsign: 'AERO-ACTUAL',
  },
  {
    uid: 'u_adm_01',
    name: 'Chief Insp. Rajesh Sharma',
    email: 'ops@raksha.internal',
    role: 'ADMIN',
    callsign: 'HQ-DISPATCH',
  },
  {
    uid: 'u_res_01',
    name: 'SDRF Officer Ananya Sen',
    email: 'rescue.bravo@sdrf.gov.in',
    role: 'RESPONDER',
    callsign: 'BOAT-UNIT-04',
  },
  {
    uid: 'u_viw_01',
    name: 'State Disaster Observer',
    email: 'observer@disaster.tn.gov.in',
    role: 'VIEWER',
    callsign: 'MONITOR-02',
  },
];

// Venice disaster central reference coordinates: Lat ~45.4380, Lng ~12.3220 (Adyar / Velachery / Saidapet basin)
export const initialMissions: Mission[] = [
  {
    missionId: 'MSN-2026-09A',
    missionName: 'Venice Flood Search & Rescue — DEMO',
    disasterType: 'Flood + Structural Damage',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    assignedRakshaIds: ['RAKSHA-01', 'RAKSHA-02', 'RAKSHA-03'],
    searchPattern: 'LAWNMOWER_GRID',
    startTime: '2026-09-06T20:30:00Z',
    searchArea: [
      { lat: 45.4530, lng: 12.3020 },
      { lat: 45.4630, lng: 12.3470 },
      { lat: 45.4280, lng: 12.3620 },
      { lat: 45.4130, lng: 12.3120 },
    ],
    areaCoveredKm2: 12.6,
    targetAreaKm2: 18.0,
    altitudeTarget: 75,
    maxDurationMinutes: 180,
  },
  {
    missionId: 'MSN-2026-08B',
    missionName: 'Tambaram Canal Reconnaissance',
    disasterType: 'Flood + Structural Damage',
    status: 'COMPLETED',
    priority: 'HIGH',
    assignedRakshaIds: ['RAKSHA-01'],
    searchPattern: 'PERIMETER_RECON',
    startTime: '2026-09-06T14:00:00Z',
    endTime: '2026-09-06T16:45:00Z',
    searchArea: [
      { lat: 12.925, lng: 80.110 },
      { lat: 12.940, lng: 80.135 },
      { lat: 12.915, lng: 80.145 },
      { lat: 12.905, lng: 80.120 },
    ],
    areaCoveredKm2: 6.4,
    targetAreaKm2: 6.4,
    altitudeTarget: 90,
    maxDurationMinutes: 120,
  },
];

export const initialRakshas: Raksha[] = [
  {
    rakshaId: 'RAKSHA-01',
    name: 'AeroScout Alpha',
    model: 'Skydio X2-D Edge (NVIDIA Jetson Orin Nano)',
    status: 'ACTIVE',
    navMode: 'GPS_MODE',
    battery: 78,
    latitude: 45.4405,
    longitude: 12.3265,
    altitude: 82,
    speed: 8.4,
    heading: 42,
    signalStrength: -68,
    gpsStatus: 'RTK_FIX',
    imuStatus: 'CALIBRATED',
    cameraStatus: 'STREAMING',
    thermalStatus: 'ACTIVE',
    currentMissionId: 'MSN-2026-09A',
    flightTimeMinutes: 44,
    distanceTravelledKm: 14.2,
    zone: 'Search Zone A (Adyar Basin)',
    lastSeen: 'Just now',
  },
  {
    rakshaId: 'RAKSHA-02',
    name: 'AeroSurvey Bravo',
    model: 'DJI Matrice 350 RTK (Raspberry Pi 5 AI Edge Kit)',
    status: 'ACTIVE',
    navMode: 'GPS_DENIED_SLAM',
    battery: 64,
    latitude: 45.4262,
    longitude: 12.3411,
    altitude: 95,
    speed: 6.8,
    heading: 185,
    signalStrength: -74,
    gpsStatus: 'DEGRADED',
    imuStatus: 'CALIBRATED',
    cameraStatus: 'STREAMING',
    thermalStatus: 'ACTIVE',
    currentMissionId: 'MSN-2026-09A',
    flightTimeMinutes: 52,
    distanceTravelledKm: 18.7,
    zone: 'Search Zone B (Velachery Lowlands)',
    lastSeen: 'Just now',
  },
  {
    rakshaId: 'RAKSHA-03',
    name: 'AeroThermal Charlie',
    model: 'Teledyne FLIR SIRAS (Edge Coral TPU Dual-Core)',
    status: 'ACTIVE',
    navMode: 'GPS_MODE',
    battery: 89,
    latitude: 45.4490,
    longitude: 12.3130,
    altitude: 68,
    speed: 9.1,
    heading: 275,
    signalStrength: -62,
    gpsStatus: 'LOCKED',
    imuStatus: 'CALIBRATED',
    cameraStatus: 'STREAMING',
    thermalStatus: 'ACTIVE',
    currentMissionId: 'MSN-2026-09A',
    flightTimeMinutes: 28,
    distanceTravelledKm: 9.6,
    zone: 'Thermal Search Zone C (Saidapet Sector)',
    lastSeen: 'Just now',
  },
];

export const initialSurvivors: Survivor[] = [
  {
    survivorId: 'S-014',
    detectionId: 'DET-9921',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    latitude: 45.4422,
    longitude: 12.3288,
    confidence: 96,
    priorityScore: 94,
    priorityLevel: 'CRITICAL',
    peopleCount: 4,
    nearbyHazards: ['Exposed 11kV line', 'Fast current water surge', 'Damaged residential roof'],
    rescueStatus: 'Detected',
    detectedAt: '6 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Family stranded on rooftop slab. Water level rising ~15cm/hr.',
  },
  {
    survivorId: 'S-012',
    detectionId: 'DET-9892',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    latitude: 45.4245,
    longitude: 12.3432,
    confidence: 93,
    priorityScore: 89,
    priorityLevel: 'CRITICAL',
    peopleCount: 2,
    nearbyHazards: ['Submerged vehicle trap', 'Water depth > 2.4m'],
    rescueStatus: 'Rescue Assigned',
    detectedAt: '14 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Two individuals holding onto tree canopy above flooded street.',
  },
  {
    survivorId: 'S-009',
    detectionId: 'DET-9810',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    latitude: 45.4528,
    longitude: 12.3105,
    confidence: 88,
    priorityScore: 84,
    priorityLevel: 'CRITICAL',
    peopleCount: 6,
    nearbyHazards: ['Unstable brick wall', 'Electrical spark discharge'],
    rescueStatus: 'Verified',
    detectedAt: '21 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Elderly care home upper floor. Signal beacon observed.',
  },
  {
    survivorId: 'S-018',
    detectionId: 'DET-9950',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    latitude: 45.4378,
    longitude: 12.3215,
    confidence: 91,
    priorityScore: 78,
    priorityLevel: 'HIGH',
    peopleCount: 3,
    nearbyHazards: ['Flood depth 1.2m', 'Debris blocking staircase'],
    rescueStatus: 'Rescue Assigned',
    detectedAt: '28 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Second floor balcony occupants signalling for drinking water.',
  },
  {
    survivorId: 'S-007',
    detectionId: 'DET-9755',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    latitude: 45.4195,
    longitude: 12.3350,
    confidence: 85,
    priorityScore: 72,
    priorityLevel: 'HIGH',
    peopleCount: 1,
    nearbyHazards: ['Heavy silt/mudflow'],
    rescueStatus: 'Verified',
    detectedAt: '36 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Single adult clinging to utility pylon platform.',
  },
  {
    survivorId: 'S-021',
    detectionId: 'DET-9982',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    latitude: 45.4562,
    longitude: 12.3190,
    confidence: 82,
    priorityScore: 68,
    priorityLevel: 'HIGH',
    peopleCount: 5,
    nearbyHazards: ['Floodwater 0.8m'],
    rescueStatus: 'Detected',
    detectedAt: '42 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Commercial complex roof. Safe from current surge for at least 3 hours.',
  },
  {
    survivorId: 'S-004',
    detectionId: 'DET-9640',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    latitude: 45.4350,
    longitude: 12.3305,
    confidence: 79,
    priorityScore: 58,
    priorityLevel: 'MEDIUM',
    peopleCount: 2,
    nearbyHazards: ['Debris field'],
    rescueStatus: 'Monitoring',
    detectedAt: '51 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Safe high ground identified. Awaiting inflatable boat unit.',
  },
  {
    survivorId: 'S-005',
    detectionId: 'DET-9685',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    latitude: 45.4290,
    longitude: 12.3500,
    confidence: 84,
    priorityScore: 54,
    priorityLevel: 'MEDIUM',
    peopleCount: 1,
    nearbyHazards: ['Stagnant floodwater'],
    rescueStatus: 'Rescue Assigned',
    detectedAt: '1 hr ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Security guard stationed on elevated pump house.',
  },
  {
    survivorId: 'S-002',
    detectionId: 'DET-9512',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    latitude: 45.4455,
    longitude: 12.3050,
    confidence: 95,
    priorityScore: 42,
    priorityLevel: 'LOW',
    peopleCount: 2,
    nearbyHazards: [],
    rescueStatus: 'Rescued',
    detectedAt: '1 hr 15m ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'SDRF Boat Unit 02 evacuated safely to relief camp.',
  },
  {
    survivorId: 'S-001',
    detectionId: 'DET-9480',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    latitude: 45.4305,
    longitude: 12.3170,
    confidence: 97,
    priorityScore: 35,
    priorityLevel: 'LOW',
    peopleCount: 1,
    nearbyHazards: [],
    rescueStatus: 'Rescued',
    detectedAt: '1 hr 30m ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Extricated by hovercraft squad.',
  },
  {
    survivorId: 'S-025',
    detectionId: 'DET-9994',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    latitude: 45.4215,
    longitude: 12.3240,
    confidence: 89,
    priorityScore: 81,
    priorityLevel: 'CRITICAL',
    peopleCount: 3,
    nearbyHazards: ['Structural wall collapse', 'Rising floodwater'],
    rescueStatus: 'Detected',
    detectedAt: '3 mins ago',
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    notes: 'Children and guardian stranded on porch slab.',
  },
];

export const initialHazards: Hazard[] = [
  {
    hazardId: 'HAZ-001',
    detectionId: 'DET-H101',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    hazardType: 'Electrical line',
    severity: 'CRITICAL',
    confidence: 96,
    latitude: 45.4418,
    longitude: 12.3295,
    status: 'AI Detected',
    recommendedResponse: 'Dispatch TANGEDCO emergency grid shutoff. Keep rescue boats > 50m away.',
    imageUrl: createSvgImageDataUrl('electrical'),
    detectedAt: '8 mins ago',
    radiusMeters: 45,
  },
  {
    hazardId: 'HAZ-002',
    detectionId: 'DET-H102',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    hazardType: 'Fire',
    severity: 'CRITICAL',
    confidence: 98,
    latitude: 45.4515,
    longitude: 12.3160,
    status: 'Human Verified',
    recommendedResponse: 'Deploy Fire & Rescue foam unit. Flammable gas cylinders detected nearby.',
    imageUrl: createSvgImageDataUrl('fire'),
    detectedAt: '12 mins ago',
    radiusMeters: 60,
  },
  {
    hazardId: 'HAZ-003',
    detectionId: 'DET-H103',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    hazardType: 'Flood',
    severity: 'CRITICAL',
    confidence: 95,
    latitude: 45.4255,
    longitude: 12.3400,
    status: 'Human Verified',
    recommendedResponse: 'Velachery main road breach. Flow velocity 2.2 m/s. Avoid low draft watercraft.',
    imageUrl: createSvgImageDataUrl('flood'),
    detectedAt: '18 mins ago',
    radiusMeters: 120,
  },
  {
    hazardId: 'HAZ-004',
    detectionId: 'DET-H104',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    hazardType: 'Unstable building',
    severity: 'CRITICAL',
    confidence: 92,
    latitude: 45.4435,
    longitude: 12.3245,
    status: 'AI Detected',
    recommendedResponse: 'Three-story residential block foundation scour. Clear 30m perimeter immediately.',
    imageUrl: createSvgImageDataUrl('damage'),
    detectedAt: '25 mins ago',
    radiusMeters: 35,
  },
  {
    hazardId: 'HAZ-005',
    detectionId: 'DET-H105',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    hazardType: 'Damaged structure',
    severity: 'HIGH',
    confidence: 89,
    latitude: 45.4310,
    longitude: 12.3470,
    status: 'Human Verified',
    recommendedResponse: 'Culvert collapsed. Route blocked for all wheeled emergency response vehicles.',
    imageUrl: createSvgImageDataUrl('damage'),
    detectedAt: '31 mins ago',
    radiusMeters: 40,
  },
  {
    hazardId: 'HAZ-006',
    detectionId: 'DET-H106',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    hazardType: 'Smoke',
    severity: 'HIGH',
    confidence: 87,
    latitude: 45.4540,
    longitude: 12.3210,
    status: 'AI Detected',
    recommendedResponse: 'Dense toxic smoke plume from burning transformer oil. Instruct residents to close vents.',
    imageUrl: createSvgImageDataUrl('fire'),
    detectedAt: '37 mins ago',
    radiusMeters: 90,
  },
  {
    hazardId: 'HAZ-007',
    detectionId: 'DET-H107',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    hazardType: 'Debris',
    severity: 'HIGH',
    confidence: 91,
    latitude: 45.4360,
    longitude: 12.3190,
    status: 'Human Verified',
    recommendedResponse: 'Fallen rain-trees and sheet metal impeding waterway access to Sector 4.',
    imageUrl: createSvgImageDataUrl('debris'),
    detectedAt: '45 mins ago',
    radiusMeters: 50,
  },
  {
    hazardId: 'HAZ-008',
    detectionId: 'DET-H108',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    hazardType: 'Flood',
    severity: 'HIGH',
    confidence: 94,
    latitude: 45.4190,
    longitude: 12.3510,
    status: 'AI Detected',
    recommendedResponse: 'Lake outflow inundating southern arterial highway.',
    imageUrl: createSvgImageDataUrl('flood'),
    detectedAt: '52 mins ago',
    radiusMeters: 150,
  },
  {
    hazardId: 'HAZ-009',
    detectionId: 'DET-H109',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    hazardType: 'Landslide',
    severity: 'HIGH',
    confidence: 88,
    latitude: 45.4590,
    longitude: 12.3080,
    status: 'Human Verified',
    recommendedResponse: 'Embankment slope slip along canal bund. Structural engineers needed.',
    imageUrl: createSvgImageDataUrl('debris'),
    detectedAt: '1 hr ago',
    radiusMeters: 75,
  },
  {
    hazardId: 'HAZ-010',
    detectionId: 'DET-H110',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    hazardType: 'Chemical hazard',
    severity: 'HIGH',
    confidence: 84,
    latitude: 45.4470,
    longitude: 12.3330,
    status: 'AI Detected',
    recommendedResponse: 'Industrial chemical drum leakage detected in floodwater stream.',
    imageUrl: createSvgImageDataUrl('debris'),
    detectedAt: '1 hr 10m ago',
    radiusMeters: 65,
  },
  {
    hazardId: 'HAZ-011',
    detectionId: 'DET-H111',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    hazardType: 'Electrical line',
    severity: 'MEDIUM',
    confidence: 86,
    latitude: 45.4275,
    longitude: 12.3310,
    status: 'Resolved',
    recommendedResponse: 'Low-tension pole severed; local grid isolated by district crew.',
    imageUrl: createSvgImageDataUrl('electrical'),
    detectedAt: '1 hr 20m ago',
    radiusMeters: 25,
  },
  {
    hazardId: 'HAZ-012',
    detectionId: 'DET-H112',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    hazardType: 'Debris',
    severity: 'MEDIUM',
    confidence: 82,
    latitude: 45.4500,
    longitude: 12.3260,
    status: 'Human Verified',
    recommendedResponse: 'Roofing tin sheets scattered on street intersection.',
    imageUrl: createSvgImageDataUrl('debris'),
    detectedAt: '1 hr 35m ago',
    radiusMeters: 30,
  },
  {
    hazardId: 'HAZ-013',
    detectionId: 'DET-H113',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    hazardType: 'Damaged structure',
    severity: 'MEDIUM',
    confidence: 79,
    latitude: 45.4390,
    longitude: 12.3140,
    status: 'AI Detected',
    recommendedResponse: 'Boundary wall partial collapse. No occupants endangered.',
    imageUrl: createSvgImageDataUrl('damage'),
    detectedAt: '1 hr 45m ago',
    radiusMeters: 20,
  },
  {
    hazardId: 'HAZ-014',
    detectionId: 'DET-H114',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    hazardType: 'Flood',
    severity: 'LOW',
    confidence: 76,
    latitude: 45.4230,
    longitude: 12.3170,
    status: 'Resolved',
    recommendedResponse: 'Shallow street standing water < 0.3m. Receding slowly.',
    imageUrl: createSvgImageDataUrl('flood'),
    detectedAt: '2 hrs ago',
    radiusMeters: 40,
  },
  {
    hazardId: 'HAZ-015',
    detectionId: 'DET-H115',
    rakshaId: 'RAKSHA-03',
    missionId: 'MSN-2026-09A',
    hazardType: 'Unstable building',
    severity: 'CRITICAL',
    confidence: 94,
    latitude: 45.4575,
    longitude: 12.3155,
    status: 'AI Detected',
    recommendedResponse: 'Corner column sheared. Secondary collapse imminent upon ground vibration.',
    imageUrl: createSvgImageDataUrl('damage'),
    detectedAt: '5 mins ago',
    radiusMeters: 45,
  },
];

export const initialAlerts: Alert[] = [
  {
    alertId: 'ALT-101',
    detectionId: 'DET-9921',
    alertType: 'SURVIVOR_CRITICAL',
    severity: 'CRITICAL',
    message: 'Possible survivors (4 people) stranded on collapsing rooftop near live 11kV line.',
    recommendation: 'Immediate rescue boat dispatch required. Coordinate power grid isolation.',
    latitude: 45.4422,
    longitude: 12.3288,
    rakshaId: 'RAKSHA-01',
    status: 'NEW',
    createdAt: '6 mins ago',
  },
  {
    alertId: 'ALT-102',
    detectionId: 'DET-H102',
    alertType: 'FIRE_HAZARD',
    severity: 'CRITICAL',
    message: 'Electrical transformer fire erupting near Saidapet Sector C residential perimeter.',
    recommendation: 'Reroute rakshas to safe altitude. Notify fire station #4 and dispatch foam truck.',
    latitude: 45.4515,
    longitude: 12.3160,
    rakshaId: 'RAKSHA-03',
    status: 'ACKNOWLEDGED',
    createdAt: '12 mins ago',
    acknowledgedAt: '10 mins ago',
    acknowledgedBy: 'Cmdr. Sushmitha R.',
  },
  {
    alertId: 'ALT-103',
    detectionId: 'DET-H101',
    alertType: 'ELECTRICAL_LINE',
    severity: 'CRITICAL',
    message: 'Exposed live overhead conductor submerged in fast-flowing floodwater.',
    recommendation: 'Issue immediate emergency warning to boat rescue crews in Sector 2.',
    latitude: 45.4418,
    longitude: 12.3295,
    rakshaId: 'RAKSHA-01',
    status: 'NEW',
    createdAt: '8 mins ago',
  },
  {
    alertId: 'ALT-104',
    detectionId: 'DET-H103',
    alertType: 'FLOOD_SURGE',
    severity: 'HIGH',
    message: 'Floodwater surge detected crossing planned emergency evacuation corridor.',
    recommendation: 'Reroute SDRF convoy through elevated GST Road interchange.',
    latitude: 45.4255,
    longitude: 12.3400,
    rakshaId: 'RAKSHA-02',
    status: 'ASSIGNED',
    createdAt: '18 mins ago',
    acknowledgedAt: '15 mins ago',
    acknowledgedBy: 'SDRF Officer Ananya Sen',
  },
  {
    alertId: 'ALT-105',
    detectionId: 'DET-H104',
    alertType: 'STRUCTURAL_COLLAPSE',
    severity: 'HIGH',
    message: 'Unstable masonry structure exhibiting 8.4° lean over rescue access lane.',
    recommendation: 'Barricade lane from both ends; mark as red zone on command map.',
    latitude: 45.4435,
    longitude: 12.3245,
    rakshaId: 'RAKSHA-01',
    status: 'NEW',
    createdAt: '25 mins ago',
  },
];

export const initialWaypoints: Waypoint[] = [
  { id: 'WP-01', missionId: 'MSN-2026-09A', sequence: 1, latitude: 45.4480, longitude: 12.3120, altitude: 75, action: 'WAYPOINT', status: 'REACHED' },
  { id: 'WP-02', missionId: 'MSN-2026-09A', sequence: 2, latitude: 45.4530, longitude: 12.3270, altitude: 80, action: 'SCAN', status: 'REACHED' },
  { id: 'WP-03', missionId: 'MSN-2026-09A', sequence: 3, latitude: 45.4430, longitude: 12.3370, altitude: 80, action: 'THERMAL_SWEEP', status: 'ACTIVE' },
  { id: 'WP-04', missionId: 'MSN-2026-09A', sequence: 4, latitude: 45.4330, longitude: 12.3470, altitude: 85, action: 'SCAN', status: 'PENDING' },
  { id: 'WP-05', missionId: 'MSN-2026-09A', sequence: 5, latitude: 45.4230, longitude: 12.3370, altitude: 85, action: 'HOVER', status: 'PENDING' },
  { id: 'WP-06', missionId: 'MSN-2026-09A', sequence: 6, latitude: 45.4280, longitude: 12.3220, altitude: 75, action: 'WAYPOINT', status: 'PENDING' },
  { id: 'WP-07', missionId: 'MSN-2026-09A', sequence: 7, latitude: 45.4380, longitude: 12.3170, altitude: 70, action: 'SCAN', status: 'PENDING' },
];

// Removed demo cards must not return from previously saved browser state.
export const removedDemoDetectionIds = new Set(['DET-H101', 'DET-H102', 'DET-9892', 'DET-H104']);

export const initialDetections: Detection[] = [
  {
    detectionId: 'DET-9921',
    rakshaId: 'RAKSHA-01',
    missionId: 'MSN-2026-09A',
    category: 'People',
    detectionType: 'Survivor Group',
    confidence: 96,
    severity: 'CRITICAL',
    latitude: 45.4422,
    longitude: 12.3288,
    imageUrl: createSvgImageDataUrl('survivor'),
    thermalImageUrl: createSvgImageDataUrl('thermal_person'),
    timestamp: '2026-09-06T23:48:00Z',
    verificationStatus: 'AI Detected',
    boundingBox: { x: 40, y: 35, w: 25, h: 30, label: 'SURVIVOR x4 (96%)' },
  },
  {
    detectionId: 'DET-H103',
    rakshaId: 'RAKSHA-02',
    missionId: 'MSN-2026-09A',
    category: 'Hazards',
    detectionType: 'Floodwater Surge',
    confidence: 95,
    severity: 'CRITICAL',
    latitude: 45.4255,
    longitude: 12.3400,
    imageUrl: createSvgImageDataUrl('flood'),
    timestamp: '2026-09-06T23:36:00Z',
    verificationStatus: 'Human Verified',
    boundingBox: { x: 20, y: 30, w: 60, h: 45, label: 'WATER BREACH (95%)' },
  },
];
